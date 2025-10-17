export default function ShopItemCard({ name, type, price }: any) {
    return (
      <div className="border p-4 rounded-xl shadow-sm bg-white">
        <h2 className="text-lg font-semibold">{name}</h2>
        <p>Type: {type}</p>
        <p>Price: {price} coins</p>
        <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">Buy</button>
      </div>
    );
  }
  