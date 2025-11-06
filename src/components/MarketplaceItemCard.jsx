import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCart, getCachedCart, onCartUpdate } from '../utils/cartApi'
import { getAuth, onAuthUpdate } from '../utils/auth'

function MarketplaceItemCard({ item }) {
    const navigate = useNavigate()
    const [auth, setAuth] = useState(getAuth())
    const [isInCart, setIsInCart] = useState(false)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

    const checkIfInCart = async () => {
        if (!auth) {
            setIsInCart(false)
            return
        }

        try {
            const cached = getCachedCart()
            if (cached) {
                const inCart = cached.items?.some(cartItem => cartItem._id === item._id)
                setIsInCart(inCart)
            } else {
                const cartData = await getCart()
                const inCart = cartData.items?.some(cartItem => cartItem._id === item._id)
                setIsInCart(inCart)
            }
        } catch (error) {
            setIsInCart(false)
        }
    }

    useEffect(() => {
        checkIfInCart()

        const unsubscribeCart = onCartUpdate(checkIfInCart)
        
        const unsubscribeAuth = onAuthUpdate(() => {
            setAuth(getAuth())
            checkIfInCart()
        })
        
        return () => {
            unsubscribeCart()
            unsubscribeAuth()
        }
    }, [auth, item._id])

    const handleClick = () => {
        navigate(`/browse/item/${item._id}`)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price || 0)
    }

    const getAllPhotos = () => {
        if (item.photos && item.photos.length > 0) return item.photos
        if (item.photoIndices && item.photoIndices.length > 0 && item.allPhotos) {
            return item.photoIndices.map(idx => item.allPhotos[idx]).filter(Boolean)
        }
        if (item.photo) return [item.photo]
        return []
    }

    const allPhotos = getAllPhotos()
    const photoCount = allPhotos.length
    const currentPhoto = allPhotos[currentPhotoIndex] || null

    const handlePrevPhoto = (e) => {
        e.stopPropagation()
        setCurrentPhotoIndex((prev) => (prev === 0 ? photoCount - 1 : prev - 1))
    }

    const handleNextPhoto = (e) => {
        e.stopPropagation()
        setCurrentPhotoIndex((prev) => (prev === photoCount - 1 ? 0 : prev + 1))
    }

    return (
        <div
            onClick={handleClick}
            className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#e6c35a]"
        >
            <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                {currentPhoto ? (
                    <img
                        src={currentPhoto}
                        alt={item.title || 'Estate item'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>No Image</span>
                    </div>
                )}

                {photoCount > 1 && (
                    <>
                        <button
                            onClick={handlePrevPhoto}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                            aria-label="Previous photo"
                        >
                            ←
                        </button>
                        <button
                            onClick={handleNextPhoto}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                            aria-label="Next photo"
                        >
                            →
                        </button>
                        
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                            {allPhotos.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        idx === currentPhotoIndex ? 'bg-[#e6c35a] w-4' : 'bg-white/60'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {item.category && (
                    <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                            {item.category}
                        </span>
                    </div>
                )}

                {photoCount > 1 && (
                    <div className="absolute top-3 left-3 mt-8">
                        <span className="px-2 py-1 bg-[#e6c35a] text-black text-xs font-bold rounded-full">
                            📷 {currentPhotoIndex + 1}/{photoCount}
                        </span>
                    </div>
                )}

                {isInCart && (
                    <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                            ✓ In Cart
                        </span>
                    </div>
                )}

                <div className="absolute bottom-3 right-3">
                    <span className="px-4 py-2 bg-[#e6c35a] text-black text-lg font-bold rounded-lg shadow-lg">
                        {formatPrice(item.price)}
                    </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold text-[#101010] mb-2 line-clamp-2 group-hover:text-[#e6c35a] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {item.title || 'Untitled Item'}
                </h3>

                {item.description && (
                    <p className="text-sm text-[#707072] line-clamp-2 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {item.description}
                    </p>
                )}

                <div className="mt-4">
                    <div className={`w-full py-2 text-center rounded-lg font-semibold text-sm transition-colors ${
                        isInCart 
                            ? 'bg-green-600 text-white' 
                            : 'bg-[#101010] text-white'
                    }`}>
                        {isInCart ? '✓ In Cart - View Details' : 'View Details →'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MarketplaceItemCard