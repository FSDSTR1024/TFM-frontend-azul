import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Columna del Logotipo */}
        <div className="footer-logo">
          <img src="/path-to-logo.png" alt="Cocinas Ayala Logo" />
          <p>Diseño que transforma, espacios que inspiran.</p>
        </div>

        {/* Columna de Datos de Contacto */}
        <div className="footer-contact">
          <h3>Contáctanos</h3>
          <p><strong>Teléfono:</strong> +34 696 767 563</p>
          <p><strong>Email:</strong> beatriz@estudioayalainteriorismo.com</p>
          <p><strong>Dirección:</strong> Carretera Zabal, 8, 11300 La Línea de la Concepción, Cádiz</p>
        </div>

        {/* Columna del Mapa */}
        <div className="footer-map">
          <h3>¿Dónde estamos?</h3>
          <iframe
            title="Mapa de ubicación"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d23669.523371371135!2d-5.4311153!3d36.1774451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0cec004e70fdad%3A0x8ca5f4c390c6fa0b!2sZabal%2C%208%2C%2011300%20La%20L%C3%ADnea%20de%20la%20Concepci%C3%B3n%2C%20C%C3%A1diz!5e0!3m2!1ses!2ses!4v1695668419344!5m2!1ses!2ses"
            style={{ border: "0" }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Estudios Ayala. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
