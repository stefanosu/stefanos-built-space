import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Publications from "@/components/Publications";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Publications />
      <Portfolio />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
