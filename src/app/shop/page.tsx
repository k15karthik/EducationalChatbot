import ShopItemCard from "../components/ShopItemCard";

export default function ShopPage() {
  const items = [
    { name: "Cool Avatar", type: "Avatar", price: 100 },
    { name: "MiniGame 1", type: "Minigame", price: 200 },
  ];

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar Navbar */}
      <aside className="w-64 border-r border-gray-200 p-6 flex flex-col justify-between pr-100px sm-text-[100px]">
        <div>
          <h1 className="text-2xl font-bold mb-8">Edu-Chatbot</h1>
          <nav className="space-y-4">
            <a href="/" className="block font-medium hover:text-blue-600">
              Home
            </a>
            <a href="/shop" className="block font-medium hover:text-blue-600">
              Shop
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-200 mb-4">
          <a
            href="/profile"
            className="block font-medium text-black hover:text-blue-600 transition"
          >
            Profile
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-12 py-10">
        <h1 className="text-3xl font-bold mb-8">Shop</h1>
        <div className="grid grid-cols-2 gap-6 max-w-3xl">
          {items.map((item, idx) => (
            <ShopItemCard key={idx} {...item} />
          ))}
        </div>
      </main>
    </div>
  );
}
