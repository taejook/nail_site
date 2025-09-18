import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <section>
      <p>Contact us:</p>
      <p>Email: lucynailedit@gmail.com</p>
      <p>Phone: (123) 456-7890</p>
      <p>Address: 123 Nail St, Beauty City, CA 90210</p>
      </section>
      <p>© {new Date().getFullYear()} Lucy Nailed It. All Rights Reserved.</p>
    </footer>
  );
}
