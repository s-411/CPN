export default function SimpleTestPage() {
  return (
    <html>
      <head>
        <title>Simple Test</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-900 text-white p-8">
        <h1 className="text-2xl">Simple Test Page</h1>
        <p>If you can see this, the basic routing works!</p>
        <div className="mt-4 p-4 bg-yellow-400 text-black rounded">
          CPN Yellow Test
        </div>
      </body>
    </html>
  )
}