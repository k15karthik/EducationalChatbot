import ShopItemCard from "../components/ShopItemCard";

export default function ShopPage() {
  // Hardcoded for now — plug into your DB later
  const currentPoints = 420;

  const items = [
    {
      name: "5 Extra Credit Points",
      description: "Adds +5 to your overall class extra credit total.",
      price: 150,
    },
    {
      name: "10 Extra Credit Points",
      description: "Boosts your grade with +10 extra credit points.",
      price: 250,
    },
    {
      name: "25 Extra Credit Points",
      description: "Big boost! +25 extra credit points.",
      price: 500,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-10">Edu-Chatbot</h1>

          <nav className="space-y-4">
            <a href="/" className="block font-medium hover:text-blue-600">
              Home
            </a>

            <a
              href="/shop"
              className="block font-medium text-blue-600 font-semibold"
            >
              Shop
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <a
            href="/profile"
            className="block font-medium hover:text-blue-600 transition"
          >
            Profile
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-12 py-10">
        <h1 className="text-4xl font-bold mb-8">Shop</h1>

        {/* Current Points Display */}
        <div className="mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Your Points</h2>
            <p className="text-3xl font-bold flex items-center gap-2">
              <span>{currentPoints}</span>
              <span className="text-yellow-500">🪙</span>
            </p>
          </div>
        </div>

        {/* Shop Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <ShopItemCard key={idx} {...item} />
          ))}
        </div>
      </main>
    </div>
  );
}
