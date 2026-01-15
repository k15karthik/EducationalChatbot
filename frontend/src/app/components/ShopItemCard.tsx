interface ShopItemCardProps {
  name: string;
  description: string;
  price: number;
}

export default function ShopItemCard({ name, description, price }: ShopItemCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition transform">
      <h3 className="text-xl font-bold mb-2">{name}</h3>

      <p className="text-gray-600 mb-4">{description}</p>

      <div className="flex items-center justify-between mt-6">
        <span className="text-lg font-semibold flex items-center gap-1">
          {price} <span className="text-yellow-500">🪙</span>
        </span>

        <button
          className="
              bg-blue-600 text-white 
              px-4 py-2 rounded-lg 
              hover:bg-blue-700 transition
          "
        >
          Purchase
        </button>
      </div>
    </div>
  );
}
