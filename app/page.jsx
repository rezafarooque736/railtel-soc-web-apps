import AmpJsonToDocx from "@/components/amp/amp-json-to-docx";
import AttendanceDatToDocs from "@/components/attendance/dat-to-docs";

export default function page() {
	return (
		<section className="grid w-full min-h-[85vh] place-content-center">
			<div className="flex gap-6 flex-row">
				<AmpJsonToDocx />
				<AttendanceDatToDocs />
			</div>
		</section>
	);
}
