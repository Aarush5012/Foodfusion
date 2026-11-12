import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been received by our concierge team.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
          Concierge Support & Inquiries
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 font-display">
          We Are Here For You
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          Whether you need assistance with an ongoing order, catering for an event, or onboarding as a restaurant merchant, our team is available 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-stone-900 text-white p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-display">San Francisco Operations</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Serving Downtown, SoMa, Mission District, North Beach, Pacific Heights, and surrounding Bay Area neighborhoods.
            </p>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <span>500 Howard Street, San Francisco, CA 94105</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+1 (800) 555-FUSION</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>concierge@foodfusion.com</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 text-[11px] text-stone-400">
            Customer Support Hours: 8:00 AM – 11:30 PM PST Daily
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Message Dispatched</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Thank you, {name}. A member of our concierge desk will reply to {email} within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-stone-900 font-display">Send a Direct Message</h3>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you with FoodFusion 2.0?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
