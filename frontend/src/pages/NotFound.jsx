import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import PageFade from "../components/common/PageTransition";
import Seo from "../components/common/Seo";

export default function NotFound() {
  return (
    <PageFade>
      <Seo title="Page not found" noindex />
      <Container className="py-32 text-center">
        <h1 className="text-3xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-stone">The page you're looking for doesn't exist.</p>
        <Button as={Link} to="/" variant="primary" size="lg" className="mt-6">Back home</Button>
      </Container>
    </PageFade>
  );
}
