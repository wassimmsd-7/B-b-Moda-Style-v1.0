import { AppProvider } from '@/context/AppContext';
import { useRouter } from '@/lib/router';
import { Header, Footer } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { TipsPage } from '@/pages/TipsPage';
import { ContactPage } from '@/pages/ContactPage';
import { AdminPage } from '@/pages/AdminPage';
import { PosPage } from '@/pages/PosPage';
import { InstallPrompt } from '@/components/InstallPrompt';

const WHATSAPP_NUMBER = '213542886457';

function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
      aria-label="WhatsApp"
    >
      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297.149-1.255.515-1.486.572-.222.058-.383.087-.543-.087-.16-.174-.543-.572-.734-.725-.174-.16-.349-.223-.6-.075-.252.149-.888.327-1.677-.515-.618-.515-1.035-1.153-1.155-1.348-.12-.195-.013-.301.131-.449.135-.149.297-.349.446-.515.149-.165.174-.287.262-.478.087-.192.044-.349-.044-.515-.131-.165-.543-1.348-.734-1.836-.193-.478-.383-.415-.543-.478-.12-.044-.262-.044-.403-.044-.149 0-.383.058-.588.287-.204.349-.734.725-.734 1.762 0 1.036.734 2.073.849 2.223.131.149 1.49 2.288 3.622 3.21 1.286.558 1.79.602 2.43.507.391-.058 1.194-.489 1.36-.961.174-.478.174-.888.131-.961-.044-.073-.174-.116-.418-.232z"/>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.2 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.3-1.25-2.81-1.25-4.36 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42 1.56 1.56 2.42 3.63 2.42 5.82 0 4.54-3.7 8.24-8.24 8.24z"/>
      </svg>
      <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Contactez-nous
      </span>
    </a>
  );
}

function AppContent() {
  const { route, navigate } = useRouter();
  const isFullScreen = route.name === 'admin' || route.name === 'pos' || route.name === 'staffLogin';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {!isFullScreen && <Header navigate={navigate} />}

      {route.name === 'home' && <HomePage navigate={navigate} />}
      {route.name === 'shop' && <ShopPage navigate={navigate} />}
      {route.name === 'product' && <ProductPage productId={route.id} navigate={navigate} />}
      {route.name === 'cart' && <CartPage navigate={navigate} />}
      {route.name === 'checkout' && <CheckoutPage navigate={navigate} />}
      {route.name === 'orderSuccess' && <OrderSuccessPage orderNumber={route.orderNumber} navigate={navigate} />}
      {route.name === 'trackOrder' && <TrackOrderPage navigate={navigate} />}
      {route.name === 'tips' && <TipsPage navigate={navigate} />}
      {route.name === 'contact' && <ContactPage navigate={navigate} />}
      {route.name === 'admin' && <AdminPage navigate={navigate} />}
      {route.name === 'pos' && <PosPage navigate={navigate} />}
      {route.name === 'staffLogin' && <AdminPage navigate={navigate} />}

      {!isFullScreen && <Footer navigate={navigate} />}
      {!isFullScreen && <WhatsAppButton />}
      {!isFullScreen && <InstallPrompt />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
