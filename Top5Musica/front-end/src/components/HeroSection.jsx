export default function HeroSection({ title, subtitle, bgImage, artistImage }) {
  return (
    <div 
      className="relative w-full h-80 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-orange-900/70"></div>
      
      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex flex-col items-center text-white text-center px-4">
        <img 
          src={artistImage} 
          alt={subtitle} 
          className="w-32 h-32 rounded-full border-4 border-white mb-4 object-cover shadow-lg"
        />
        <h1 className="text-3xl md:text-5xl font-bold mb-2">{title}</h1>
        <p className="text-lg md:text-xl font-medium">{subtitle}</p>
      </div>
    </div>
  );
}