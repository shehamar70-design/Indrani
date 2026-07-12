/**
 * RemoteImage — plain <img> for aggregated RSS thumbnails. Feed image hosts
 * are unbounded, so next/image (allowlisted hosts + optimizer proxy) can't
 * be used for them; next/image stays for Indrani-owned assets only.
 * Fills its positioned parent like next/image `fill`.
 */

export default function RemoteImage({
  src,
  priority = false,
}: {
  src: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
