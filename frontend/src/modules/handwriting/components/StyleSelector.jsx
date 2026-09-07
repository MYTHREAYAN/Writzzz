import StyleCard from "./StyleCard";

export default function StyleSelector({ selectedStyle, onSelectStyle }) {
  const styles = [
    {
      id: "Running Letter",
      title: "Running Letter",
      description: "Continuous, cursive-style handwriting where letters naturally connect with each other.",
      samplePreview: "The quick brown fox jumps",
    },
    {
      id: "Separated Letter",
      title: "Separated Letter",
      description: "Clear print-style handwriting where individual letters are distinctly separated.",
      samplePreview: "T h e  q u i c k  b r o w n  f o x",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink-900">Select Handwriting Style</h3>
        <p className="text-xs text-ink-700">
          Choose the style that best matches your natural writing preference.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {styles.map((style) => (
          <StyleCard
            key={style.id}
            id={style.id}
            title={style.title}
            description={style.description}
            samplePreview={style.samplePreview}
            isSelected={selectedStyle === style.id}
            onSelect={onSelectStyle}
          />
        ))}
      </div>
    </section>
  );
}
