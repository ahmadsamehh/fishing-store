export default function ProductImage({ product, ratio = '1 / 1' }) {
  if (product.image) {
    return <img className="pimg" src={product.image} alt={product.name} style={{ aspectRatio: ratio }} />;
  }
  return (
    <div className="pimg pimg-empty" style={{ aspectRatio: ratio }}>
      No image yet
    </div>
  );
}
