export interface INearestShops {
  _id: string;
  businessName: string;
  coordinates: {
    lat: string;
    lng: string;
  };
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  distance: number;
  totalReviews: number;
  averageRating: number;
  productCount: number;
}
