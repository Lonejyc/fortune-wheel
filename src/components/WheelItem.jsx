import del from "../assets/Delete.svg";
export default function WheelItem({ itemInfo, onItemDelete }) {
    // state
  
    // comportements
  
    // affichage (render)
    return (
      <li key={itemInfo.value}>
        {itemInfo.label}{" "}
        <button className="button-del" onClick={() => onItemDelete(itemInfo.value)}><img src={del} alt="Croix"/></button>
      </li>
    );
  }