
export interface BrandVideoResponse {
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  uploadDate: Date;
}

export interface BrandResponse {
  brandId?: string;
  brandName: string;
  brandDescription?: string;
  brandLogo?: string[];
  brandVideos?: BrandVideoResponse[];
  interaction?: string;
  createdAt?: Date;
}

export interface OfferResponse {
  offerId?: string;
  offerName: string;
  offerDescription?: string;
  offerImage?: string[] | string;
  offerType?: string;
  savedAt?: Date;
  redeemedAt?: Date;
}

export interface BrandWithOffersResponse extends BrandResponse {
  offers: OfferResponse[];
}

export interface VideoStatusResponse {
  offerId: string;
  offerName: string;
  brandName: string;
  offerImage: string[] | string;
  videoUrl: string[];
  duration: string;
  postedAt: Date;
  videoId?: string;
}

export interface SearchSuggestion {
  type: string;
  brandId?: string;
  brandName?: string;
  offerId?: string;
  offerName?: string;
  offerImage?: string[] | string;
}

export interface OfferDetailsResponse {
  offerId: string;
  offerName: string;
  offerDescription: string;
  offerImage: string[];
  offerDiscount: string;
  offerInstore: boolean;
  // offerOnline: boolean;
  offerTermsCondition: string;
}
