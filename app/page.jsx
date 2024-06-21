import AmpJsonToDocx from "@/components/amp/amp-json-to-docx";
import AttendanceDatToDocsAndDownload from "@/components/attendance-download-excel/dat-to-docs-and-download";
import AttendanceDatToDocs from "@/components/attendance/dat-to-docs";

export default function page() {
  return (
    <section className="grid w-full min-h-[85vh] place-content-center">
      <div className="flex flex-row flex-wrap items-center justify-center gap-6">
        <AmpJsonToDocx />
        <AttendanceDatToDocs />
        <AttendanceDatToDocsAndDownload />
      </div>
    </section>
  );
}
