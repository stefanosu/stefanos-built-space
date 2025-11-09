import { useState } from "react";
import { Mail, Linkedin, Github, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      toast.error("Please verify you're human.");
      return;
    }

    try {
      const res = await fetch(
        "https://contact-resend.stefanosugbit.workers.dev",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            turnstileToken,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");

      toast.success("Message sent! I'll get back to you soon.");

      // Reset form
      setFormData({ name: "", email: "", message: "" });
      setTurnstileToken(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send message. Try again later.";
      toast.error(message);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-24 py-16 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Have a project in mind or just want to connect? Let's talk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 animate-slide-up">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Connect</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:stefanos.ugbit@gmail.com"
                    className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span>stefanos.ugbit@gmail.com</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/stefanosugbit/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="https://github.com/stefanosu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center group-hover:bg-accent/20 transition-all duration-300">
                      <Github className="w-5 h-5" />
                    </div>
                    <span>GitHub</span>
                  </a>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="bg-card border-border focus:border-accent transition-colors duration-300"
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="bg-card border-border focus:border-accent transition-colors duration-300"
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    rows={6}
                    className="bg-card border-border resize-none focus:border-accent transition-colors duration-300"
                  />
                </div>

                <Turnstile
                  siteKey="YOUR_REAL_SITE_KEY"
                  className="rounded-md"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />

                <Button type="submit" size="lg" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
