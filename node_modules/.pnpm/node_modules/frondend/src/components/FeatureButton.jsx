export default function FeatureButton({ icon, label, onClick }) {
  return (
    <div onClick={onClick} className="d-flex flex-column align-items-center p-5 mt-5 mb-0" style={{ width: '80px' }}>
      <img src={icon} alt={label} style={{ width: 60, height: 60 }} />
      <div className="mt-2 text-center" style={{ fontSize: '0.9rem' }}>{label}</div>
    </div>
  );
}