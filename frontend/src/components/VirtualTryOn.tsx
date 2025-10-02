import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { EnrichedProduct } from '../types';
import Spinner from './sPINNER';
import { ArrowLeftIcon, UploadIcon, CameraIcon, XIcon, HistoryIcon, TrashIcon, DownloadIcon } from './icon';

// --- Base helpers --- //
const dot = (a: number[], b: number[]): number => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
    return sum;
};

const magnitude = (a: number[]): number => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
    return Math.sqrt(sum);
};

// Cosine similarity
const cosineSimilarity = (a: number[], b: number[]): number => {
    if (a.length !== b.length) return 0;
    const magA = magnitude(a);
    const magB = magnitude(b);
    if (magA === 0 || magB === 0) return 0;
    const cos = dot(a, b) / (magA * magB);
    return Math.max(-1, Math.min(1, cos)); // clamp [-1,1]
};

// Euclidean similarity (inverse distance)
const euclideanSimilarity = (a: number[], b: number[]): number => {
    if (a.length !== b.length) return 0;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return 1 / (1 + Math.sqrt(sum)); // normalize to (0,1]
};

// Pearson correlation similarity
const pearsonSimilarity = (a: number[], b: number[]): number => {
    if (a.length !== b.length) return 0;
    const n = a.length;
    if (n === 0) return 0;
    const meanA = a.reduce((s, v) => s + v, 0) / n;
    const meanB = b.reduce((s, v) => s + v, 0) / n;

    let num = 0, denA = 0, denB = 0;
    for (let i = 0; i < n; i++) {
        const da = a[i] - meanA;
        const db = b[i] - meanB;
        num += da * db;
        denA += da * da;
        denB += db * db;
    }
    if (denA === 0 || denB === 0) return 0;
    return num / Math.sqrt(denA * denB);
};

// --- Final Hybrid Similarity --- //
export const ultraSimilarity = (a: number[], b: number[]): number => {
    const cos = cosineSimilarity(a, b);
    const eucl = euclideanSimilarity(a, b);
    const pearson = pearsonSimilarity(a, b);

    // Weighted combo — tuned for embeddings
    return (0.5 * cos) + (0.3 * eucl) + (0.2 * pearson);
};

// Helper function to convert model image URL to a File
const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        return new File([blob], filename, { type: mimeType });
    } catch (e) {
        console.error("Error converting URL to file:", e);
        return null;
    }
};

interface VirtualTryOnProps {
    product: EnrichedProduct;
    allProducts: EnrichedProduct[];
    onBack: () => void;
}

const loadingMessages = [
    "Warming up the AI stylist...",
    "Analyzing your photo...",
    "Finding the perfect fit...",
    "Stitching the look together...",
    "Applying realistic lighting and shadows...",
    "Adding the finishing touches...",
];

interface FileData {
    mimeType: string;
    data: string;
}

const HISTORY_KEY = 'fashion-gallery-history';
const MAX_HISTORY_ITEMS = 6;

interface HistoryImage {
    id: string;
    dataUrl: string;
}

const dataURLtoFile = (dataUrl: string, filename: string): File | null => {
    try {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0]?.match(/:(.*?);/);
        if (!arr[1] || !mimeMatch || !mimeMatch[1]) return null;
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (e) {
        console.error("Error converting data URL to file:", e);
        return null;
    }
};

const fileToData = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            if (!header || !data) {
                return reject(new Error("Invalid file format."));
            }
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (!mimeType) {
                return reject(new Error("Could not determine file MIME type."));
            }
            resolve({ mimeType, data });
        };
        reader.onerror = error => reject(error);
    });
};

const allDummyModels = [
    { id: 'woman_full', path: '/images/models/woman.png', alt: 'Female model', product_gender: 'Women', category: ['Clothes'] },
    { id: 'man_full', path: '/images/models/man.png', alt: 'Male model', product_gender: 'Men', category: ['Clothes'] },
    { id: 'woman_shoes', path: '/images/models/woman_shoes.png', alt: 'Female model for shoes', product_gender: 'Women', category: ['Shoes'] },
    { id: 'man_shoes', path: '/images/models/man_shoes.png', alt: 'Male model for shoes', product_gender: 'Men', category: ['Shoes'] },
    { id: 'woman_bags', path: '/images/models/woman_bags.png', alt: 'Female model for bags', product_gender: 'Women', category: ['Bags'] },
    { id: 'man_bags', path: '/images/models/man_bags.png', alt: 'Male model for bags', product_gender: 'Men', category: ['Bags'] }
];

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ product, allProducts, onBack }) => {
    const [mainProduct, setMainProduct] = useState<EnrichedProduct>(product);
    const [userImageFile, setUserImageFile] = useState<File | null>(null);
    const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [imageHistory, setImageHistory] = useState<HistoryImage[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { similarProducts, similarsError } = useMemo(() => {
        try {
            const mainProductWithEmbedding = allProducts.find(p => p.product_id === mainProduct.product_id);
            if (!mainProductWithEmbedding?.product_embedding) {
                throw new Error("Could not find embedding for the selected product.");
            }
            const queryEmbedding = mainProductWithEmbedding.product_embedding;
            const mainProductGender = mainProductWithEmbedding.PRODUCT_GENDER;

            let similarities = allProducts
                .filter(p => 
                    p.product_id !== mainProduct.product_id && 
                    p.product_embedding &&
                    p.PRODUCT_GENDER === mainProductGender
                )
                .map(p => ({
                    product: p,
                    similarity: ultraSimilarity(queryEmbedding, p.product_embedding)
                }));
                
            similarities.sort((a, b) => b.similarity - a.similarity);

            if (mainProductWithEmbedding.GROUP_CODE) {
                similarities = similarities.filter(item => item.product.GROUP_CODE !== mainProductWithEmbedding.GROUP_CODE);
            }
            
            const topProducts = similarities.slice(0, 15).map(item => item.product);
            return { similarProducts: topProducts, similarsError: null };
        } catch (err: any) {
            console.error("Failed to calculate similar products:", err);
            return { similarProducts: [], similarsError: err.message || "Could not load similar items." };
        }
    }, [mainProduct, allProducts]);

    const filteredModels = useMemo(() => {
        const productCategory = mainProduct.CATEGORY;
        const productGender = mainProduct.PRODUCT_GENDER;
        if (!productCategory || !productGender) return [];
      
        const categoryMatch = allDummyModels.filter(model => 
          model.category.includes(productCategory)
        );
      
        if (productGender === 'Unisex') {
          return categoryMatch.length > 0 ? categoryMatch : allDummyModels.filter(m => m.category.includes('Clothes'));
        }
        
        const specificMatch = categoryMatch.filter(model => model.product_gender === productGender);
      
        if (specificMatch.length > 0) {
          return specificMatch;
        } 
        
        return allDummyModels.filter(model => 
          model.product_gender === productGender && model.category.includes('Clothes')
        );
      }, [mainProduct]);

    const handleDummyPhotoSelect = async (photoPath: string) => {
        setError(null);
        setGeneratedImage(null);
        setUserImagePreview(photoPath);
        const filename = photoPath.split('/').pop() || 'model.png';
        const file = await urlToFile(photoPath, filename, 'image/png');
        if (file) {
            setUserImageFile(file);
            saveImageToHistory(photoPath);
        } else {
            setError("Could not load the selected model image.");
        }
    };

    useEffect(() => {
        setMainProduct(product);
        setGeneratedImage(null);
        setError(null);
    }, [product]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            if (storedHistory) {
                setImageHistory(JSON.parse(storedHistory));
            }
        } catch (err) {
            console.error("Failed to load image history from localStorage:", err);
        }
    }, []);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const selectedElement = scrollContainerRef.current.querySelector(`[data-product-id="${mainProduct.product_id}"]`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [mainProduct]);

    const saveImageToHistory = useCallback((dataUrl: string) => {
        const newHistoryItem: HistoryImage = { id: `${Date.now()}`, dataUrl };
        setImageHistory(prevHistory => {
            const newHistory = [newHistoryItem, ...prevHistory.filter(item => item.dataUrl !== dataUrl)].slice(0, MAX_HISTORY_ITEMS);
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            } catch (err) {
                console.error("Failed to save image history to localStorage:", err);
            }
            return newHistory;
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUserImageFile(file);
            setGeneratedImage(null);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setUserImagePreview(dataUrl);
                saveImageToHistory(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTryOn = useCallback(async () => {
        if (!userImageFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setGeneratedImage(null);
        setError(null);
        let messageInterval: NodeJS.Timeout | undefined;
        try {
            let messageIndex = 0;
            messageInterval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 3000);
            const { mimeType, data: base64Image } = await fileToData(userImageFile);
            setLoadingMessage("Generating your virtual look...");
            const response = await fetch('/api/generate-try-on', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_image_b64: base64Image,
                    user_image_mime: mimeType,
                    product: mainProduct,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || 'An unknown error occurred on the server.');
            }
            setGeneratedImage(`data:image/png;base64,${result.generated_image_b64}`);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during the try-on process.');
            setGeneratedImage(null);
        } finally {
            setIsLoading(false);
            if (messageInterval) clearInterval(messageInterval);
        }
    }, [userImageFile, mainProduct]);

    const handleOpenCamera = async () => {
        setError(null);
        setIsCameraOpen(true);
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            if (videoRef.current) videoRef.current.srcObject = streamRef.current;
        } catch (err) {
            console.warn('Front camera failed, trying any camera.', err);
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) videoRef.current.srcObject = streamRef.current;
            } catch (finalError: any) {
                let errorMessage = 'Could not access the camera. Please check permissions.';
                if (finalError.name === 'NotAllowedError' || finalError.name === 'PermissionDeniedError') errorMessage = 'Camera access denied. Please enable permissions in your browser.';
                setError(errorMessage);
                setIsCameraOpen(false);
            }
        }
    };

    const handleCloseCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsCameraOpen(false);
    };

    const handleCapture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
            if (file) {
                setUserImageFile(file);
                setUserImagePreview(dataUrl);
                saveImageToHistory(dataUrl);
                setGeneratedImage(null);
                setError(null);
            }
        }
        handleCloseCamera();
    };

    const handleProductSelect = (selectedProduct: EnrichedProduct) => {
        if (selectedProduct.product_id === mainProduct.product_id) return;
        setMainProduct(selectedProduct);
        setGeneratedImage(null);
        setError(null);
    };

    const handleSelectFromHistory = useCallback((image: HistoryImage) => {
        setUserImagePreview(image.dataUrl);
        const file = dataURLtoFile(image.dataUrl, `history-${image.id}.jpg`);
        if (file) {
            setUserImageFile(file);
            setGeneratedImage(null);
            setError(null);
        } else {
            setError("Could not load the selected image. It might be corrupted.");
        }
    }, []);

    const handleDeleteFromHistory = useCallback((idToDelete: string) => {
        setImageHistory(prevHistory => {
            const newHistory = prevHistory.filter(item => item.id !== idToDelete);
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            } catch (err) {
                console.error("Failed to update image history in localStorage:", err);
            }
            return newHistory;
        });
    }, []);

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        const productName = mainProduct.PRODUCT_NAME || 'fashion-item';
        const sanitizedName = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        link.download = `virtual-try-on-${sanitizedName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section>
            <button onClick={onBack} className="flex items-center gap-2 mb-8 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                <ArrowLeftIcon className="h-5 w-5" />
                Back to Collection
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Panel */}
                <div className="flex flex-col items-center p-8 bg-[var(--color-panel)] rounded-lg border border-[var(--color-panel-border)]">
                    <h2 className="text-2xl font-light mb-4 text-center tracking-wider">1. Choose an Item</h2>
                    <div className="w-full mb-8 min-h-[224px] flex items-center justify-center">
                        {similarsError && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">{similarsError}</p>}
                        {!similarsError && (
                            <div ref={scrollContainerRef} className="flex items-center overflow-x-auto space-x-4 py-2 px-2 -mx-2 snap-x snap-mandatory scrollbar-thin">
                                {[mainProduct, ...similarProducts].map((p, index) => (
                                    <div
                                        key={p.product_id}
                                        data-product-id={p.product_id}
                                        onClick={() => handleProductSelect(p)}
                                        className={`relative flex-shrink-0 w-40 flex flex-col rounded-lg cursor-pointer transition-all duration-300 snap-center
                                            ${mainProduct.product_id === p.product_id 
                                                ? 'scale-105 shadow-[0_0_25px_-5px_rgba(212,175,55,0.3)]' 
                                                : 'opacity-60 hover:opacity-100 hover:scale-105'
                                            }`}
                                        role="button"
                                        aria-pressed={mainProduct.product_id === p.product_id}
                                        aria-label={`Select product ${p.PRODUCT_NAME || p.product_id}`}
                                    >
                                        <div className="w-full h-52 relative">
                                            <img 
                                                src={p.product_url} 
                                                alt={p.PRODUCT_NAME || `Product ${p.product_id}`}
                                                className="w-full h-full object-cover rounded-t-md"
                                            />
                                            <div className={`absolute inset-0 rounded-t-md ring-2 transition-all duration-300 ${mainProduct.product_id === p.product_id ? 'ring-[var(--color-accent)]' : 'ring-transparent'}`}></div>
                                            {index === 0 && (
                                                <span className="absolute top-2 left-2 bg-[var(--color-accent)] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                                    Your Pick
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-2 bg-gray-900/50 rounded-b-md flex-grow flex flex-col justify-center">
                                            <p className="text-xs font-bold text-gray-300 truncate">{p.BRAND_NAME}</p>
                                            <p className="text-xs text-gray-400 truncate">{p.PRODUCT_NAME}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-light mb-4 tracking-wider">2. Upload Your Photo</h2>
                    <label htmlFor="file-upload" className="w-full max-w-sm border border-[var(--color-panel-border)] bg-black/20 rounded-lg p-6 text-center cursor-pointer hover:border-[var(--color-accent)] transition-colors">
                        <input type="file" id="file-upload" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        {userImagePreview ? (
                            <img src={userImagePreview} alt="User preview" className="w-full h-auto rounded-md object-contain max-h-60" />
                        ) : (
                            <div className="flex flex-col items-center text-[var(--color-text-secondary)]">
                                <UploadIcon className="h-10 w-10 mb-2" />
                                <p className="font-semibold text-[var(--color-text-primary)]">Click to upload</p>
                                <p className="text-xs mt-1">or drag and drop</p>
                            </div>
                        )}
                    </label>
                    
                    <div className="relative w-full max-w-sm flex items-center my-4">
                        <div className="flex-grow border-t border-[var(--color-panel-border)]"></div>
                        <span className="flex-shrink mx-4 text-[var(--color-text-secondary)] text-sm">OR</span>
                        <div className="flex-grow border-t border-[var(--color-panel-border)]"></div>
                    </div>

                    <button onClick={handleOpenCamera} className="w-full max-w-sm flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-[var(--color-panel-border)] rounded-md hover:bg-[var(--color-panel-border)] hover:text-[var(--color-accent-hover)] font-semibold" aria-label="Open camera to take a photo">
                        <CameraIcon className="h-5 w-5" />
                        Use Camera
                    </button>
                    
                    <div className="w-full max-w-sm mt-4">
                        <p className="text-center text-sm text-[var(--color-text-secondary)] mb-3">
                            Or select a model:
                        </p>
                        <div className="flex justify-center gap-4">
                            {filteredModels.map(model => (
                                <div
                                    key={model.id}
                                    className={`w-24 h-40 rounded-lg cursor-pointer ring-2 p-1 bg-black/20
                                        ${userImagePreview === model.path
                                            ? 'ring-[var(--color-accent)]'
                                            : 'ring-transparent hover:ring-gray-600'
                                        } transition-all`}
                                    onClick={() => handleDummyPhotoSelect(model.path)}
                                >
                                    <img
                                        src={model.path}
                                        alt={model.alt}
                                        className="w-full h-full object-contain rounded-md"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex flex-col items-center p-8 bg-[var(--color-panel)] rounded-lg border border-[var(--color-panel-border)]">
                    <h2 className="text-2xl font-light mb-4 tracking-wider">3. Your Virtual Look</h2>
                    
                    <div className="w-full flex-grow flex items-center justify-center bg-black/20 rounded-lg min-h-[400px] relative group">
                        {isLoading && ( <div className="text-center p-4"><Spinner /><p className="mt-4 text-[var(--color-accent)]">{loadingMessage}</p></div> )}
                        {!isLoading && error && <p className="text-red-400 bg-red-900/50 p-4 rounded-lg max-w-md text-center border border-red-800">{error}</p>}
                        
                        {!isLoading && !error && generatedImage && (
                            <>
                                <img src={generatedImage} alt="Generated virtual try-on" className="max-w-full max-h-[500px] h-auto rounded-lg object-contain animate-fade-in" />
                                <button onClick={handleDownload} className="absolute bottom-4 right-4 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-[var(--color-accent)] hover:text-black transition-all duration-300" aria-label="Download generated image">
                                    <DownloadIcon className="h-6 w-6" />
                                </button>
                            </>
                        )}
                        
                        {!isLoading && !error && !generatedImage && ( <div className="text-center text-[var(--color-text-secondary)] p-4"><p>Your AI-generated image will appear here.</p></div> )}
                    </div>
                    
                    {userImagePreview && (
                        <button onClick={handleTryOn} disabled={isLoading} className="mt-6 w-full max-w-sm px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-lg hover:bg-[var(--color-accent-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105">
                            {isLoading ? 'Generating...' : generatedImage ? 'Generate Again' : 'Generate Look'}
                        </button>
                    )}
                </div>
            </div>
            
            {isCameraOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
                    <div className="relative bg-[var(--color-panel)] p-4 rounded-lg border border-[var(--color-panel-border)] w-full max-w-3xl">
                        <button onClick={handleCloseCamera} className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full hover:bg-black/80">
                            <XIcon className="h-6 w-6" />
                        </button>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md transform -scale-x-100"></video>
                        <button onClick={handleCapture} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-black rounded-md hover:bg-[var(--color-accent-hover)] font-semibold">
                            <CameraIcon className="h-5 w-5" />
                            Capture
                        </button>
                    </div>
                </div>
            )}

            {imageHistory.length > 0 && (
                <div className="mt-16">
                    <h3 className="text-xl font-light tracking-wider mb-4 flex items-center gap-2 justify-center text-[var(--color-text-secondary)]"><HistoryIcon className="h-6 w-6" /> Your Recent Photos</h3>
                    <div className="flex justify-center gap-3 flex-wrap">
                        {imageHistory.map(image => (
                            <div key={image.id} className="group relative w-24 h-32 flex-shrink-0">
                                <img 
                                    src={image.dataUrl} 
                                    alt="User history" 
                                    className="w-full h-full object-cover rounded-md cursor-pointer ring-2 ring-transparent group-hover:ring-[var(--color-accent)]"
                                    onClick={() => handleSelectFromHistory(image)}
                                />
                                <button 
                                    onClick={() => handleDeleteFromHistory(image.id)}
                                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600/80"
                                    aria-label="Delete image from history"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </section>
    );
};

export default VirtualTryOn;