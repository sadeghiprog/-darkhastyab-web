import { AuthProvider } from "../context/AuthContext"; // مسیر فایل کانتکست خود را چک کنید
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../app/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {/* کل اپلیکیشن باید داخل AuthProvider باشد */}
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}
