export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="container-content">
                <div className="footer-content">
                    <p className="footer-text">
                        © {currentYear} Margin
                    </p>
                    <p className="footer-text">
                        A magazine about performance in sport
                    </p>
                </div>
            </div>
        </footer>
    )
}
