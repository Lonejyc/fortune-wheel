export default function WheelItem({ itemInfo, onItemDelete }) {
    // state
  
    // comportements
  
    // affichage (render)
    return (
      <li key={itemInfo.value}>
        {itemInfo.label}{" "}
        <button onClick={() => onItemDelete(itemInfo.value)}>X</button>
      </li>
    );
  }