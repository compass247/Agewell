import BusinessCard from "../../../src/components/BusinessCard.jsx";
import { getCardContent, buildCardMetadata } from "../../../src/card-content.js";

// Digital business card — https://compassagewell.com/chaunguyen
// The slug is encoded in public/assets/qr-chaunguyen.{png,svg}, which BD
// prints and hands out, so it must not change.
export const metadata = buildCardMetadata("chaunguyen");

export default function ChauNguyenCard() {
  return <BusinessCard card={getCardContent("chaunguyen")} />;
}
