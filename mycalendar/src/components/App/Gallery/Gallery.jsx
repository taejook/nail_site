import { nails } from "../../../utils/constants.js";
import "./Gallery.css";
console.log(nails)
export default function Gallery() {
  return (
    <div className="app">
      <div className="gallery" id="gallery">
        <h1>Gallery</h1>
        <p>Check out some of our nail designs and services.</p>

        <div className="gallery-grid">
          {nails.map((item) => (
            <div key={item.id} className="gallery-card">
              <img src={item.url} alt={item.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}