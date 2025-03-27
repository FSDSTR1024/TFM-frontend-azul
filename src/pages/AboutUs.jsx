import React from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-page">
      <Navbar />
      
      {/* Sección Hero */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 id="hero-title">Nuestra Historia</h1>
          <p>Transformando la logística, conectando personas</p>
        </div>
      </section>

      {/* Sección Misión */}
      <section className="about-mission">
        <div className="mission-content">
          <div className="mission-text">
            <h2 id="mission-title">Nuestra Misión</h2>
            <p>
              En FlashGo, creemos que cada paquete cuenta una historia. 
              Nuestro objetivo es simplificar las entregas, conectar 
              comunidades y hacer que cada envío sea una experiencia 
              sin complicaciones.
            </p>
          </div>
          
          <div className="mission-values">
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16.5c-3.58 0-6.5-2.92-6.5-6.5S8.42 5.5 12 5.5s6.5 2.92 6.5 6.5-2.92 6.5-6.5 6.5zm.75-11H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <h3 id="innovation-title">Innovación</h3>
              <p>Mejoramos constantemente nuestros servicios</p>
            </div>
            
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.74c-2.34 0-4.38-1.47-5.12-3.54h1.67c.69 1.44 2.14 2.44 3.75 2.44s3.06-1 3.75-2.44h1.67c-.74 2.07-2.78 3.54-5.12 3.54z"/>
                </svg>
              </div>
              <h3 id="trust-title">Confianza</h3>
              <p>Construimos relaciones sólidas con nuestros clientes</p>
            </div>
            
            <div className="value-item">
              <div className="value-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17v-2h-2v2H9.5v-2c-1.93 0-3.5-1.57-3.5-3.5 0-1.93 1.57-3.5 3.5-3.5V5h2v2h2V5h1.5v2c1.93 0 3.5 1.57 3.5 3.5 0 1.93-1.57 3.5-3.5 3.5v2h-2zm0-4v-2h-2v2h2z"/>
                </svg>
              </div>
              <h3 id="sustainability-title">Sostenibilidad</h3>
              <p>Comprometidos con prácticas ecológicas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Equipo */}
      <section className="about-team">
        <h2 id="team-title">Nuestro Equipo</h2>
        <div className="team-content">
          <div className="team-member">
            <h3 id="maria-title">María Rodríguez</h3>
            <p>Fundadora & CEO</p>
          </div>
          <div className="team-member">
            <h3 id="carlos-title">Carlos Martínez</h3>
            <p>Director de Operaciones</p>
          </div>
          <div className="team-member">
            <h3 id="ana-title">Ana López</h3>
            <p>Directora de Tecnología</p>
          </div>
        </div>
      </section>

      {/* Sección Impacto */}
      <section className="about-impact">
        <h2 id="impact-title">Nuestro Impacto</h2>
        <div className="impact-content">
          <div className="impact-stat">
            <span>+5000</span>
            <p>Envíos Diarios</p>
          </div>
          <div className="impact-stat">
            <span>99%</span>
            <p>Satisfacción de Clientes</p>
          </div>
          <div className="impact-stat">
            <span>+10</span>
            <p>Ciudades Cubiertas</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;