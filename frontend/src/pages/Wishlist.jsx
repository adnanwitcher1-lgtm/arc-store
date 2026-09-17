import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import ProductGrid from "../components/product/ProductGrid";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { user } = useAuth();
  const { items } = useWishlist();

  if (!user) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-semibold text-ink">Log in to see your wishlist</h1>
        <div className="mt-6 flex justify-center gap-3">
          <Button as={Link} to="/login" variant="primary" size="lg">Log in</Button>
          <Button as={Link} to="/register" variant="secondary" size="lg">Create account</Button>
        </div>
      </Container>
    );
  }

  return (
    <PageFade>
      <Container className="py-10">
        <h1 className="text-3xl font-semibold text-ink">Your wishlist</h1>
        <div className="mt-8">
          <ProductGrid products={items.map((i) => i.product)} />
        </div>
      </Container>
    </PageFade>
  );
}
