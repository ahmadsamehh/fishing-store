import Link from 'next/link';
import { WHATSAPP_NUMBER } from '@/lib/config';

export const metadata = {
  title: 'How ordering works',
  description: 'Order reef aquarium supplies on Marjan in four steps: add to cart, check out, send on WhatsApp, and we confirm and deliver.',
};

const steps = [
  { title: 'Add to cart', text: 'Open a product, choose the quantity and press Add to cart, or Buy now to go straight to checkout. Your cart is saved on your device, and in your account if you are signed in.' },
  { title: 'Check out', text: 'Open the cart and press Checkout. Enter your name, mobile number, governorate and address. You can also share your exact location from your phone and add notes for the driver.' },
  { title: 'Send on WhatsApp', text: 'Press Send order on WhatsApp. WhatsApp opens with your full order already written, including an order number. Press send in WhatsApp to place the order.' },
  { title: 'We confirm and deliver', text: 'We reply on WhatsApp to confirm stock, the delivery fee and the delivery time. Once confirmed, we send your order to your address.' },
];

const faqs = [
  { q: 'Do I need an account to order?', a: 'No. You can order as a guest. With a free account, your delivery details are filled in for you and you can follow every order under My orders.' },
  { q: 'How do I pay?', a: 'Nothing is charged on the website. The total, the delivery fee and how you pay are confirmed with you on WhatsApp before your order is sent.' },
  { q: 'How do I know where my order is?', a: 'With an account, open My account and then My orders to see each order\'s status: Ordered, Confirmed, Out for delivery or Delivered. We also update you on WhatsApp.' },
  { q: 'I closed WhatsApp before sending. What now?', a: 'Use Open WhatsApp again on the confirmation page. With an account, you can also resend any order from My orders.' },
  { q: 'Can I change or cancel my order?', a: 'Yes. Message us on WhatsApp with your order number, which starts with M, and we will update it for you.' },
];

export default function HowToOrder() {
  return (
    <div className="wrap section page-pad hto">
      <div className="h-head">
        <h1>How ordering <strong>works</strong></h1>
        <p>No card needed. You order on the site and confirm on WhatsApp.</p>
      </div>

      <ol className="h-steps">
        {steps.map((s, i) => (
          <li className="h-step" key={s.title}>
            <span className="h-step-n">{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>

      <section className="hto-faq">
        <h2>Questions</h2>
        {faqs.map((f) => (
          <details key={f.q} className="hto-q">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <div className="hto-cta">
        <div>
          <h2>Still have a question?</h2>
          <p>Message us on WhatsApp and we will help you choose.</p>
        </div>
        <div className="hto-btns">
          <a className="btn btn-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
          <Link className="btn btn-pink" href="/products">Start shopping</Link>
        </div>
      </div>
    </div>
  );
}
