import React, { useState } from "react";
import axios from "axios";
import logo from './logo-roseane.jpg';

const SERVICES = [
  {
    name: "Mão e pé",
    price: 60,
    desc: "Cuidado completo para mãos e pés, incluindo corte, lixamento, hidratação e esmaltação.",
    proc: "Higienização, corte, lixamento, hidratação, cuticulagem e esmaltação profissional."
  },
  {
    name: "Mão",
    price: 30,
    desc: "Tratamento especial para as mãos, deixando-as macias e bem cuidadas.",
    proc: "Corte, lixamento, hidratação, cuticulagem e esmaltação."
  },
  {
    name: "Pé",
    price: 35,
    desc: "Cuidados essenciais para pés saudáveis e bonitos.",
    proc: "Higienização, corte, lixamento, hidratação, cuticulagem e esmaltação."
  },
  {
    name: "Micropigmentação",
    price: 300,
    desc: "Sobrancelhas perfeitas e naturais com técnica moderna e segura.",
    proc: "Avaliação, design, anestesia tópica e aplicação do pigmento fio a fio."
  },
  {
    name: "Designer de sobrancelhas",
    price: 35,
    desc: "Realce do olhar com design personalizado para cada rosto.",
    proc: "Mapeamento, design, remoção de pelos e finalização."
  },
  {
    name: "Designer com henna",
    price: 50,
    desc: "Sobrancelhas marcantes e definidas com henna de alta fixação.",
    proc: "Design, aplicação de henna e finalização."
  },
  {
    name: "Designer com tintura",
    price: 70,
    desc: "Coloração suave para sobrancelhas, realçando o olhar.",
    proc: "Design, aplicação de tintura e finalização."
  },
  {
    name: "Alongamento de unhas",
    price: 130,
    desc: "Unhas longas, resistentes e naturais com alongamento em gel.",
    proc: "Preparação, aplicação de tips ou molde, gel e acabamento."
  },
  {
    name: "Manutenção de alongamento",
    price: 90,
    desc: "Manutenção para alongamento de unhas, garantindo durabilidade.",
    proc: "Remoção do excesso, nivelamento, aplicação de gel e acabamento."
  },
  {
    name: "Banho de gel",
    price: 90,
    desc: "Proteção e brilho para unhas naturais com banho de gel.",
    proc: "Preparação, aplicação de gel e polimento."
  },
  {
    name: "Manutenção",
    price: 70,
    desc: "Manutenção regular para unhas alongadas ou naturais.",
    proc: "Nivelamento, polimento e acabamento."
  },
  {
    name: "Esmaltação em gel",
    price: 50,
    desc: "Esmalte duradouro, brilho intenso e secagem rápida.",
    proc: "Preparação, aplicação de base, esmalte em gel e cabine UV."
  },
  {
    name: "Lash lifting",
    price: 70,
    desc: "Curvatura natural e duradoura para os cílios.",
    proc: "Limpeza, aplicação do produto, curvatura e hidratação dos fios."
  }
];

const WEEK_TIMES = ["16:30", "17:30", "18:30"];
const SATURDAY_TIMES = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const SHEET_API_URL = "https://api.sheetbest.com/sheets/98636701-310a-4b10-aedb-3bd11e9e7afe";

function getAvailableTimes(date) {
  const d = new Date(date);
  if (d.getDay() === 6) return SATURDAY_TIMES; // Sábado
  if (d.getDay() === 0) return []; // Domingo
  return WEEK_TIMES; // Segunda a sexta
}

function BookingForm({ onSubmit, selectedService }) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    servico: selectedService || "",
    data: "",
    horario: "",
  });

  const [times, setTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "data") {
      setTimes(getAvailableTimes(value));
      setForm((f) => ({ ...f, horario: "" }));
      setLoading(true);
      try {
        const res = await axios.get(`${SHEET_API_URL}?data=${value}`);
        setBookedTimes(res.data.map(item => item.horario));
      } catch {
        setBookedTimes([]);
      }
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await axios.post(SHEET_API_URL, form);
    setLoading(false);
    onSubmit(form);
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <label>
        Nome
        <input name="nome" required value={form.nome} onChange={handleChange} />
      </label>
      <label>
        Telefone
        <input name="telefone" required value={form.telefone} onChange={handleChange} />
      </label>
      <label>
        E-mail
        <input name="email" type="email" required value={form.email} onChange={handleChange} />
      </label>
      <label>
        Serviço
        <select name="servico" required value={form.servico} onChange={handleChange}>
          <option value="">Selecione</option>
          {SERVICES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} - R$ {s.price},00
            </option>
          ))}
        </select>
      </label>
      <label>
        Data
        <input name="data" type="date" required value={form.data} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
      </label>
      <label>
        Horário
        <select name="horario" required value={form.horario} onChange={handleChange} disabled={!form.data || loading}>
          <option value="">Selecione</option>
          {times.filter(t => !bookedTimes.includes(t)).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {loading && <span style={{color:'#e75480'}}>Carregando horários...</span>}
        {!loading && form.data && times.length > 0 && times.filter(t => !bookedTimes.includes(t)).length === 0 && (
          <span style={{color:'#e75480'}}>Todos os horários deste dia já estão ocupados.</span>
        )}
      </label>
      <button type="submit" disabled={loading}>Agendar via WhatsApp</button>
    </form>
  );
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [success, setSuccess] = useState(false);

  function handleBook(form) {
    const msg = `Olá, Roseane! Gostaria de agendar:\n
Nome: ${form.nome}
Telefone: ${form.telefone}
E-mail: ${form.email}
Serviço: ${form.servico}
Data: ${form.data}
Horário: ${form.horario}
    `;
    const url = `https://wa.me/5511966504267?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setSuccess(true);
    setShowForm(false);
  }

  return (
    <div className="main-bg">
      {/* Botões flutuantes de atalho com ícones reais */}
      <a className="floating-btn whatsapp" href="https://wa.me/5511966504267" target="_blank" rel="noopener noreferrer" title="WhatsApp">
        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg" alt="WhatsApp" style={{width: 32, height: 32}} />
      </a>
      <a className="floating-btn instagram" href="https://www.instagram.com/roseane_embelezamentodoolhar?igsh=MWpjdzE3cGs2ajJsbA==" target="_blank" rel="noopener noreferrer" title="Instagram">
        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" alt="Instagram" style={{width: 32, height: 32}} />
      </a>
      <a className="floating-btn maps" href="https://www.google.com/maps/search/?api=1&query=Rua+João+Lopes+de+Amorim,+647,+Vila+Nova+Cachoeirinha" target="_blank" rel="noopener noreferrer" title="Ver no Maps">
        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg" alt="Google Maps" style={{width: 32, height: 32}} />
      </a>

      <header className="header">
        <div className="brand-photo">
          <img src={logo} alt="Logo Roseane Brito" style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%"}} />
        </div>
        <div>
          <h1 className="calligraphy-font">Roseane Brito</h1>
          <h2 className="calligraphy-font">Estética & Beleza</h2>
        </div>
      </header>

      <section className="about">
        <h3 className="calligraphy-font">Sobre Roseane</h3>
        <p>
          Roseane Brito é referência em estética, beleza e bem-estar. Com atendimento humanizado e técnicas modernas, ela transforma autoestima e realça a beleza natural de cada cliente. Seu espaço é um convite ao autocuidado, com ambiente acolhedor e serviços de alta qualidade.
        </p>
        <p>
          “A beleza começa no momento em que você decide ser você mesma.” – esse é o lema de Roseane, que busca sempre inovar e encantar em cada atendimento.
        </p>
      </section>

      <section className="services">
        <h3 className="calligraphy-font">Serviços</h3>
        <div className="services-grid">
          {SERVICES.map((s, idx) => (
            <div className={`service-block color${(idx % 6) + 1}`} key={s.name}>
              <div className="service-title">{s.name}</div>
              <div className="service-price">R$ {s.price},00</div>
              <div className="service-desc serif-font">{s.desc}</div>
              <div className="service-proc">{s.proc}</div>
              <button className="service-btn" onClick={() => { setShowForm(true); setSelectedService(s.name); }}>
                Agendar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="booking">
        <h3 className="calligraphy-font">Agende seu horário</h3>
        <button className="main-btn" onClick={() => { setShowForm(true); setSelectedService(""); }}>
          Agendar agora
        </button>
        {showForm && (
          <div className="modal">
            <div className="modal-content">
              <button className="close" onClick={() => setShowForm(false)}>×</button>
              <BookingForm onSubmit={handleBook} selectedService={selectedService} />
            </div>
          </div>
        )}
        {success && (
          <div className="success-msg">
            Agendamento iniciado! Finalize pelo WhatsApp.
          </div>
        )}
      </section>

      <section className="contact">
        <h3 className="calligraphy-font">Contato & Localização</h3>
        <p>
          <b>WhatsApp:</b> <a href="https://wa.me/5511966504267" target="_blank" rel="noopener noreferrer">(11) 96650-4267</a><br />
          <b>Email:</b> <a href="mailto:roseaneramiro126@gmail.com">roseaneramiro126@gmail.com</a><br />
          <b>Endereço:</b> <a href="https://www.google.com/maps/search/?api=1&query=Rua+João+Lopes+de+Amorim,+647,+Vila+Nova+Cachoeirinha" target="_blank" rel="noopener noreferrer">
            Rua: João Lopes de Amorim, 647, Vila Nova Cachoeirinha
          </a><br />
          <b>Instagram:</b> <a href="https://www.instagram.com/roseane_embelezamentodoolhar?igsh=MWpjdzE3cGs2ajJsbA==" target="_blank" rel="noopener noreferrer">@roseane_embelezamentodoolhar</a>
        </p>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Roseane Brito - Todos os direitos reservados.</span>
      </footer>

      {/* Estilos profissionais, caligrafia, blocos e detalhes rosa claro */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        body, html, #root { margin: 0; padding: 0; font-family: 'Dancing Script', cursive, sans-serif; background: #111; color: #fff; }
        .main-bg { background: linear-gradient(135deg, #111 60%, #fff 100%); min-height: 100vh; }
        .header { display: flex; align-items: center; gap: 2rem; padding: 2.5rem 1rem 1.5rem 1rem; border-bottom: 1px solid #f8bbd0; }
        .brand-photo { width: 130px; height: 130px; background: #fff6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #e75480; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 16px #e7548033; border: 2px solid #e7548088; overflow: hidden; }
        .calligraphy-font { font-family: 'Dancing Script', cursive, sans-serif !important; letter-spacing: 1px; }
        .header h1 { font-size: 3.2rem; color: #fff; margin: 0; text-shadow: 2px 2px 8px #e75480; }
        .header h2 { font-size: 1.5rem; color: #e75480; margin: 0; }
        .about, .services, .booking, .contact { max-width: 900px; margin: 2.5rem auto; padding: 2rem; background: #181818; border-radius: 1.5rem; box-shadow: 0 2px 16px #e7548022; }
        .about h3, .services h3, .booking h3, .contact h3 { color: #e75480; font-size: 2rem; }
        .about p { font-size: 1.3rem; color: #fff; }
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .service-block { background: #fff; color: #111; border-radius: 1.2rem; padding: 1.5rem 1rem; box-shadow: 0 2px 16px #e7548033; display: flex; flex-direction: column; align-items: flex-start; transition: transform 0.2s, box-shadow 0.2s; }
        .service-block:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 8px 32px #e7548055; }
        .service-title { font-size: 1.5rem; font-weight: bold; color: #e75480; margin-bottom: 0.5rem; }
        .service-price { font-size: 1.2rem; color: #111; background: #f8bbd0; border-radius: 1rem; padding: 0.2rem 1rem; margin-bottom: 0.5rem; }
        .serif-font { font-family: 'Georgia', 'Times New Roman', Times, serif; font-size: 1.08rem; color: #333; }
        .service-proc { font-size: 0.98rem; margin-bottom: 1rem; color: #555; }
        .service-btn { background: linear-gradient(90deg, #e75480 60%, #f8bbd0 100%); color: #fff; border: none; padding: 0.5rem 1.2rem; border-radius: 2rem; font-weight: bold; cursor: pointer; font-family: 'Dancing Script', cursive, sans-serif; font-size: 1.1rem; transition: background 0.2s, color 0.2s; }
        .service-btn:hover { background: #fff; color: #e75480; }
        .main-btn { background: linear-gradient(90deg, #e75480 60%, #f8bbd0 100%); color: #fff; border: none; padding: 1rem 2.5rem; border-radius: 2rem; font-size: 1.3rem; font-weight: bold; cursor: pointer; margin-top: 1.5rem; font-family: 'Dancing Script', cursive, sans-serif; }
        .main-btn:hover { background: #fff; color: #e75480; }
        .booking-form { display: flex; flex-direction: column; gap: 1.2rem; }
        .booking-form label { display: flex; flex-direction: column; color: #e75480; font-weight: 600; font-family: 'Dancing Script', cursive, sans-serif; }
        .booking-form input, .booking-form select { padding: 0.7rem; border-radius: 0.7rem; border: 1px solid #e7548055; background: #fff; color: #111; font-size: 1.05rem; }
        .booking-form button { margin-top: 1.2rem; background: linear-gradient(90deg, #e75480 60%, #f8bbd0 100%); color: #fff; border: none; padding: 0.8rem; border-radius: 2rem; font-weight: bold; cursor: pointer; font-family: 'Dancing Script', cursive, sans-serif; }
        .modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #e7548044; display: flex; align-items: center; justify-content: center; z-index: 10; }
        .modal-content { background: #fff; padding: 2.5rem; border-radius: 1.5rem; min-width: 340px; position: relative; }
        .close { position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #e75480; font-size: 2.2rem; cursor: pointer; }
        .success-msg { color: #e75480; text-align: center; margin-top: 1.5rem; font-size: 1.1rem; }
        .contact a { color: #e75480; text-decoration: none; }
        .footer { text-align: center; padding: 2rem 0 1rem 0; color: #e75480; font-size: 1.1rem; font-family: 'Dancing Script', cursive, sans-serif; }
        .floating-btn { position: fixed; right: 24px; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #fff; background: linear-gradient(135deg, #e75480 60%, #f8bbd0 100%); box-shadow: 0 2px 8px #e7548044; z-index: 100; transition: background 0.2s; }
        .floating-btn.whatsapp { bottom: 170px; }
        .floating-btn.instagram { bottom: 100px; }
        .floating-btn.maps { bottom: 30px; }
        .floating-btn:hover { background: #fff; color: #e75480; }
        @media (max-width: 1100px) {
          .services-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .header { flex-direction: column; gap: 1.2rem; }
          .about, .services, .booking, .contact { padding: 1.2rem; }
          .modal-content { padding: 1rem; }
          .services-grid { grid-template-columns: 1fr; }
        }
        /* Blocos coloridos suaves */
        .color1 { background: #fff0f6; }
        .color2 { background: #f8bbd0; }
        .color3 { background: #fce4ec; }
        .color4 { background: #f3e8ff; }
        .color5 { background: #f8e8ff; }
        .color6 { background: #ffe5ec; }
      `}</style>
    </div>
  );
}

export default App;