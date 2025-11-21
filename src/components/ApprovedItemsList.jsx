import ApprovedItemCard from './ApprovedItemCard'

function ApprovedItemsList({ item, job, onMarkAsSold, onReload }) {
  if (!item.approvedItems || item.approvedItems.length === 0) return null

  const handleMarkAsSold = async (itemNumber, estateSalePrice) => {
    await onMarkAsSold(itemNumber, estateSalePrice)
    await onReload()
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#101010] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
        Approved & Listed Items
      </h3>
      <div className="space-y-6">
        {item.approvedItems.map((approvedItem, idx) => (
          <ApprovedItemCard
            key={idx}
            approvedItem={approvedItem}
            item={item}
            job={job}
            onMarkAsSold={handleMarkAsSold}
          />
        ))}
      </div>
    </div>
  )
}

export default ApprovedItemsList