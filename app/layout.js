import Header from "@/components/Header";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "RailTel SOC Gurugram Web Apps",
	description: "RailTel SOC Gurugram Web Apps",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<main className="w-screen h-full">
					<Header />
					{children}
				</main>
			</body>
		</html>
	);
}
