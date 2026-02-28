import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/sonner';
import Header from '../components/common/Header';
import { Send, Mail, Phone, Sparkles, User, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob" />
      <div className="absolute bottom-10 -left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob delay-2000" />

      <Header showBackButton onBack={() => navigate('/')} />

      <div className="relative z-10 container mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="opacity-0 animate-scale-in">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} className="text-yellow-300" />
              Get in Touch
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white opacity-0 animate-slide-up delay-200">
            Contact Us
          </h1>
          <p className="mt-3 text-white/60 max-w-lg mx-auto opacity-0 animate-fade-in delay-400">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 glass rounded-2xl p-8 opacity-0 animate-fade-in-left delay-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-white/70 text-sm font-medium mb-1.5">Your Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-white/70 text-sm font-medium mb-1.5">Message</label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3 top-3 text-white/40" />
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition resize-none"
                    placeholder="Tell us what's on your mind…"
                    rows={5}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Sending…</span>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 flex flex-col gap-5 opacity-0 animate-fade-in-right delay-500">
            <div className="glass rounded-2xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  <Mail size={18} />
                </div>
                <h3 className="text-white font-bold">Email</h3>
              </div>
              <p className="text-white/50 text-sm">support@expenseai.com</p>
            </div>

            <div className="glass rounded-2xl p-6 hover-lift">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                  <Phone size={18} />
                </div>
                <h3 className="text-white font-bold">Phone</h3>
              </div>
              <p className="text-white/50 text-sm">+1 (555) 123-4567</p>
            </div>

            <div className="glass-dark rounded-2xl p-6 flex-1 flex items-center justify-center text-center">
              <p className="text-white/40 text-sm">
                We typically respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
