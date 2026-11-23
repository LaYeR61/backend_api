export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 40 }}>
      <h1>API de Productos con Next.js</h1>
      <ul>
        <li>POST /api/auth/register</li>
        <li>POST /api/auth/login</li>
        <li>GET /api/productos (requiere token)</li>
        <li>POST /api/productos (requiere token)</li>
        <li>GET /api/productos/:id (requiere token)</li>
      </ul>
    </main>
  );
}