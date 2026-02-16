// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import brandReducer from './brandSlice';
import loginReducer from './Auth Slices/loginSlice'
import offerReducer from './offerSlice';
import liveOfferFetchReducer from './LiveOfferFetchSlice';
import previewReducer from './perviewSlice';
import pastpreviewReducer from './pastPreviewSlice';
import pastOfferFetch from './pastOfferFetchSlice';
import updateOfferReducer  from './updateOfferSlice'
import updateBrandReducer  from './updateBrandSlice'
import brandImageReducer from './uploadBrandLogo'
import brandLogoReducer from './uploadBrandImage'
import renewOfferReducer from './renewOfferSlice'
import CSVdownloadReducer from './CSVDownload'
import UploadVideoReducer  from './uploadOfferVideo';
import offerNamesReducer from './OffersName'
import PromoCodesReducer from './promoCodesSlice'
import RedemptionsRequestReducer from './redemptionsRequestSlice';
import offerApprovelReducer from './OfferApprovalSlice'
import brandVideoReducer from './brandVideoSlice';
const store = configureStore({
  reducer: {
    login: loginReducer,
    brand: brandReducer,
    offer: offerReducer,
    liveOfferFetch: liveOfferFetchReducer, 
    preview: previewReducer,
    pastOfferPreviews: pastpreviewReducer,
    pastOfferFetch: pastOfferFetch,
    updateOffer: updateOfferReducer,
    updateBrand:updateBrandReducer,
    brandImage:brandImageReducer,
    brandLogo:brandLogoReducer,
    renewOffer:renewOfferReducer,
    file:CSVdownloadReducer,
    uploadVideo:UploadVideoReducer,
    fetchOffersByBrandId:offerNamesReducer,
    promoCodes:PromoCodesReducer,
    redemptionsRequest:RedemptionsRequestReducer,
    offerApproval:offerApprovelReducer,
     brandVideo: brandVideoReducer,
  },
});

// Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export custom useAppDispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
