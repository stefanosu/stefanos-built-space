const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8 bg-card/50">
      <div className="container mx-auto px-6">
        <div className="text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Stefanos Ugbit. Building thoughtful software.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
