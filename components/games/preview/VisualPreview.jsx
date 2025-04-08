//components/games/preview/VisualPreview.jsx
export default function VisualPreview({ gameData }) {
  return (
    <div>
      {gameData.map((item, index) => (
        <div key={index}>
          <img src={item.imageUrl} alt={`Visual prompt ${index}`} />
          <ul>
            {item.choices.map((choice, i) => (
              <li key={i}>{choice}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
