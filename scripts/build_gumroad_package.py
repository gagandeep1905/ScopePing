from pathlib import Path
import shutil
import zipfile
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
STAGE = DIST / "ScopePing-Gumroad-Ready"
SOURCE = STAGE / "01 - ScopePing Source"
GUIDE = STAGE / "02 - Buyer Guide and Templates"

def esc(value):
    return (str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def make_styles():
    base = getSampleStyleSheet()
    purple = colors.HexColor("#5B4FE6")
    ink = colors.HexColor("#272B44")
    muted = colors.HexColor("#676D86")
    base.add(ParagraphStyle(name="Brand", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=9, leading=13, textColor=purple, spaceAfter=6))
    base.add(ParagraphStyle(name="Hero", parent=base["Title"], fontName="Helvetica-Bold", fontSize=24, leading=28, textColor=ink, spaceAfter=7))
    base.add(ParagraphStyle(name="SubHero", parent=base["Normal"], fontName="Helvetica", fontSize=10, leading=15, textColor=muted, spaceAfter=12))
    base.add(ParagraphStyle(name="Section", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=purple, spaceBefore=13, spaceAfter=6, keepWithNext=True))
    base.add(ParagraphStyle(name="BodySP", parent=base["BodyText"], fontName="Helvetica", fontSize=9, leading=13, textColor=ink, spaceAfter=6))
    base.add(ParagraphStyle(name="SmallSP", parent=base["BodyText"], fontName="Helvetica", fontSize=7.5, leading=10, textColor=muted, spaceAfter=4))
    base.add(ParagraphStyle(name="Field", parent=base["BodyText"], fontName="Helvetica", fontSize=9, leading=13, textColor=ink, borderColor=colors.HexColor("#E1E4F1"), borderWidth=0.5, borderPadding=7, spaceAfter=7))
    base.add(ParagraphStyle(name="Callout", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=9, leading=13, textColor=purple, backColor=colors.HexColor("#F1EFFF"), borderPadding=8, spaceBefore=6, spaceAfter=10))
    base.add(ParagraphStyle(name="CenterSP", parent=base["BodyText"], alignment=TA_CENTER, fontName="Helvetica", fontSize=8, leading=11, textColor=muted))
    return base

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#E1E4F1"))
    canvas.setLineWidth(0.5)
    canvas.line(16*mm, 14*mm, A4[0]-16*mm, 14*mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#858AA0"))
    canvas.drawString(16*mm, 9*mm, "ScopePing | Draft template - review before use")
    canvas.drawRightString(A4[0]-16*mm, 9*mm, f"Page {doc.page}")
    canvas.restoreState()

def build_quick_start(path):
    styles = make_styles()
    story = [
      Paragraph("SCOPEPING / BUYER QUICK START", styles["Brand"]),
      Paragraph("Get your first change order ready", styles["Hero"]),
      Paragraph("A practical guide to using your ScopePing download and preparing a client-ready change-order PDF.", styles["SubHero"]),
      Paragraph("1. Open the app", styles["Section"]),
      Paragraph("Extract the ZIP. Open the folder named <b>01 - ScopePing Source</b> and open <b>index.html</b> in a modern browser. The local interface and keyword-based fallback can be previewed without an API key. Keep an internet connection available for the PDF library loaded from a CDN.", styles["BodySP"]),
      Paragraph("2. Enter the original agreement", styles["Section"]),
      Paragraph("Add your project name, client, original project value, hourly rate, revision allowance and the deliverables included in the original scope. Be specific: mention page counts, integrations, revision limits, exclusions and deadlines.", styles["BodySP"]),
      Paragraph("3. Add the new client request", styles["Section"]),
      Paragraph("Describe the requested change in plain language. Run the scope comparison if you have deployed and configured the optional Gemini API. Treat AI findings as suggestions, not as a determination of legal rights.", styles["BodySP"]),
      Paragraph("4. Review the numbers", styles["Section"]),
      Paragraph("Check the suggested hours, days and price. Adjust the figures to your actual estimate and payment terms. The tool cannot know your full workload, client contract or local requirements.", styles["BodySP"]),
      Paragraph("5. Prepare your message and PDF", styles["Section"]),
      Paragraph("Generate a client reply, inspect it, and then use <b>Download change-order PDF</b>. The PDF includes the current project/request details, estimated time and fee, scope notes when available, and approval lines. It is a draft; read every section before sending.", styles["BodySP"]),
      Paragraph("6. Save your paper trail", styles["Section"]),
      Paragraph("Save the request to the local request log and export a JSON backup periodically. The log is stored in the current browser profile and does not sync between devices.", styles["BodySP"]),
      Paragraph("Optional Gemini setup", styles["Section"]),
      Paragraph("Deploy the source to your own Vercel project and add GEMINI_API_KEY as a Secret in Project Settings → Environment Variables. Optionally set GEMINI_MODEL to a supported model for your account. Redeploy after changing variables. You supply the provider key and pay any applicable provider charges.", styles["BodySP"]),
      Paragraph("Privacy + limitations", styles["Section"]),
      Paragraph("Google's unpaid Gemini API terms may allow submitted content to be used to improve Google products and may involve human review. Do not submit confidential contracts, passwords or sensitive client data through a free-tier key. ScopePing is not legal, tax or accounting advice. No API credits, hosting, domain or hosted subscription are included.", styles["Callout"]),
      Spacer(1, 8),
      Paragraph("Support: use the support contact on the product's Gumroad page. Support is limited to the included files and setup documentation; custom implementation or legal review is not included.", styles["SmallSP"])
    ]
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=16*mm, leftMargin=16*mm, topMargin=17*mm, bottomMargin=20*mm, title="ScopePing Buyer Quick Start", author="ScopePing")
    doc.build(story, onFirstPage=footer, onLaterPages=footer)

def build_change_order(path, sample=False):
    styles = make_styles()
    title = "SAMPLE CHANGE ORDER" if sample else "CHANGE ORDER / ADDITIONAL WORK PROPOSAL"
    story = [
      Paragraph("SCOPEPING / CLIENT DOCUMENT", styles["Brand"]),
      Paragraph(title, styles["Hero"]),
      Paragraph("A starting template for documenting proposed changes before additional work begins.", styles["SubHero"]),
      Paragraph("DOCUMENT DETAILS", styles["Section"]),
    ]
    pairs = [
      ("Reference", "SP-YYYYMMDD-0001" if sample else "[Reference ID]"),
      ("Prepared on", date.today().strftime("%d %B %Y") if sample else "[Date]"),
      ("Project", "Five-page business website" if sample else "[Project name]"),
      ("Client", "Sample Client" if sample else "[Client name]"),
      ("Freelancer", "Sample Studio" if sample else "[Your name / business]"),
      ("Original project value", "INR 25,000" if sample else "[Amount and currency]"),
    ]
    table = Table([[Paragraph(f"<b>{esc(k)}</b>", styles["BodySP"]), Paragraph(esc(v), styles["BodySP"])] for k,v in pairs], colWidths=[43*mm, 132*mm])
    table.setStyle(TableStyle([
      ("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#FAFAFF")),
      ("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#E1E4F1")),
      ("VALIGN",(0,0),(-1,-1),"TOP"),
      ("LEFTPADDING",(0,0),(-1,-1),8), ("RIGHTPADDING",(0,0),(-1,-1),8),
      ("TOPPADDING",(0,0),(-1,-1),6), ("BOTTOMPADDING",(0,0),(-1,-1),4),
    ]))
    story += [table, Paragraph("1. ORIGINAL AGREED SCOPE", styles["Section"])]
    story.append(Paragraph("Five-page responsive business website. Replace this with the signed proposal or statement of work summary." if sample else "[Summarize the original agreed deliverables, exclusions, revision allowance and schedule.]", styles["Field"]))
    story.append(Paragraph("2. REQUESTED CHANGE", styles["Section"]))
    story.append(Paragraph("Add a pricing page and a contact form." if sample else "[Describe the client request in clear, measurable terms.]", styles["Field"]))
    story.append(Paragraph("3. REVISED DELIVERABLES AND ACCEPTANCE", styles["Section"]))
    story.append(Paragraph("- New/changed deliverables: [List each item]<br/>- Acceptance criteria: [How completion will be confirmed]<br/>- Dependencies/client inputs: [Items needed]", styles["Field"]))
    story.append(Paragraph("4. PRICE AND TIMELINE", styles["Section"]))
    impact = [
      ("Additional hours", "6.5 hours" if sample else "[Hours]"),
      ("Hourly rate / basis", "INR 800 per hour" if sample else "[Rate or fixed-fee basis]"),
      ("Change-order fee", "INR 5,200 (sample estimate)" if sample else "[Amount and currency]"),
      ("Timeline extension", "2 days (sample estimate)" if sample else "[Time added / revised date]"),
      ("Updated project value", "INR 30,200 if approved" if sample else "[Original value + approved change]"),
    ]
    tab = Table([[Paragraph(f"<b>{esc(k)}</b>", styles["BodySP"]), Paragraph(esc(v), styles["BodySP"])] for k,v in impact], colWidths=[55*mm, 120*mm])
    tab.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#F5F3FF")),("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#E1E4F1")),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),8),("RIGHTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),2)]))
    story += [tab, Paragraph("5. CLARIFICATIONS / EXCLUSIONS", styles["Section"]), Paragraph("- [Open question / exclusion 1]<br/>- [Open question / exclusion 2]<br/>- Taxes, payment dates and delivery dependencies: [Specify]", styles["Field"]), Paragraph("6. APPROVAL", styles["Section"]), Paragraph("The additional work should not begin until the client and freelancer have approved the revised scope, fee and timeline in writing. Except for the changes explicitly approved here, the original agreement remains in effect. Review and adapt this template to the signed agreement and applicable law.", styles["BodySP"]), Spacer(1, 18)]
    sign = Table([[Paragraph("CLIENT APPROVAL / DATE", styles["SmallSP"]), Paragraph("FREELANCER APPROVAL / DATE", styles["SmallSP"])], [Paragraph("____________________________________", styles["BodySP"]), Paragraph("____________________________________", styles["BodySP"])]], colWidths=[87*mm, 87*mm], rowHeights=[9*mm, 12*mm])
    sign.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"BOTTOM"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),8)]))
    story += [sign, Spacer(1, 12), Paragraph("Template only — not legal advice. Estimates are examples, not a quote for any actual project. Verify scope, prices, deadlines, taxes and payment terms before sending.", styles["SmallSP"])]
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=16*mm, leftMargin=16*mm, topMargin=17*mm, bottomMargin=20*mm, title=title, author="ScopePing")
    doc.build(story, onFirstPage=footer, onLaterPages=footer)

def copy_source():
    SOURCE.mkdir(parents=True, exist_ok=True)
    files = ["index.html", "styles.css", "app.js", "package.json", "vercel.json", ".env.example", "README.md", "DEPLOYMENT_AND_SECURITY.md", "RELEASE_NOTES.md"]
    for name in files:
        p = ROOT / name
        if p.exists():
            shutil.copy2(p, SOURCE / name)
    api_src = ROOT / "api" / "analyze.js"
    (SOURCE / "api").mkdir(exist_ok=True)
    if api_src.exists():
        shutil.copy2(api_src, SOURCE / "api" / "analyze.js")
    src_readme = SOURCE / "README.md"
    src_readme.write_text(
      "# ScopePing source files\n\nThis folder contains the HTML/CSS/JavaScript app and optional server-side Gemini API endpoint. Start with the parent folder's Buyer Guide and Templates.\n\nPreview: open index.html in a modern browser. For live Gemini analysis, deploy to Vercel and configure GEMINI_API_KEY server-side. Do not embed or commit API keys.\n",
      encoding="utf-8"
    )

def copy_guides():
    GUIDE.mkdir(parents=True, exist_ok=True)
    source = ROOT / "product"
    for p in source.glob("*"):
        if p.is_file() and p.suffix.lower() in {".md", ".txt"}:
            shutil.copy2(p, GUIDE / p.name)
    for name in ["DEPLOYMENT_AND_SECURITY.md", "RELEASE_NOTES.md"]:
        p = ROOT / name
        if p.exists():
            shutil.copy2(p, GUIDE / name)
    build_quick_start(GUIDE / "Quick-Start.pdf")
    build_change_order(GUIDE / "Blank-Change-Order-Template.pdf", sample=False)
    build_change_order(GUIDE / "Sample-Change-Order.pdf", sample=True)
    (STAGE / "README-FIRST.txt").write_text(
      "SCOPEPING GUMROAD DOWNLOAD\n\n1. Read 02 - Buyer Guide and Templates/BUYER_START_HERE.md.\n2. Preview the web app from 01 - ScopePing Source/index.html.\n3. Read INSTALLATION.md before deployment.\n4. Optional Gemini requires your own key, configured on the server.\n5. API credits, hosting, legal advice and a hosted subscription are not included.\n6. Free-tier provider terms may allow submitted content to be used to improve provider products; test with anonymous data only.\n",
      encoding="utf-8"
    )

def zip_package():
    DIST.mkdir(parents=True, exist_ok=True)
    output = DIST / "ScopePing-Gumroad-Ready.zip"
    if output.exists():
      output.unlink()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
      for p in STAGE.rglob("*"):
        if p.is_file():
          zf.write(p, p.relative_to(DIST))
    return output

def main():
    if STAGE.exists():
      shutil.rmtree(STAGE)
    copy_source()
    copy_guides()
    output = zip_package()
    print(f"Built {output} ({output.stat().st_size} bytes)")
    for p in sorted(STAGE.rglob("*")):
      if p.is_file():
        print(f"- {p.relative_to(STAGE)} ({p.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
