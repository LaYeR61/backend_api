export const metadata = {
  title: "Autenticacion Nest.js",
  description: "Generado por Nicolas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
