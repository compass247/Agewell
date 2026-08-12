import BusinessCard from "../../../src/components/BusinessCard.jsx";
import { getCardContent, buildCardMetadata } from "../../../src/card-content.js";

// Digital business card — https://compassagewell.com/taylornguyen
// The slug is encoded in public/assets/qr-taylornguyen.{png,svg}, which BD
// prints and hands out, so it must not change.
export const metadata = buildCardMetadata("taylornguyen");

export default function TaylorNguyenCard() {
  return <BusinessCard card={getCardContent("taylornguyen")} />;
}
