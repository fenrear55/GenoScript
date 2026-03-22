## Inspiration

**Pharmacogenomic (PGx)** reports contain valuable genetic insights, but they are often delivered as dense, unstructured documents that are difficult for clinicians to quickly interpret. This creates a gap between available genetic data and real-world clinical decision-making.
We were inspired to bridge this gap by building a tool that transforms complex PGx reports into actionable, evidence-based guidance. Our goal was to reduce trial-and-error prescribing and improve patient outcomes through personalized medicine.

## What it does

GenoScript is a clinical decision-support tool that:

- Parses pharmacogenomic (PGx) reports into structured gene-phenotype data
- Stores patient data securely for future reference
- Allows clinicians to input a medication (e.g., sertraline)
- Uses **CPIC** guidelines to generate evidence-based drug recommendations
- Displays risk levels using intuitive severity flags (red, yellow, green)
  This enables providers to make faster, more informed prescribing decisions tailored to each patient’s genetic profile.

## How we built it

We built GenoScript using:

- **Next.js + TypeScript** for the frontend and application logic
- **MongoDB** for storing patient data and PGx results
- **CPIC Pharmacogenomics API** to retrieve clinical guidelines
- **Gemini** to parse unstructured PGx reports into structured gene-phenotype mappings

## Challenges we ran into

- Parsing unstructured PGx reports: Reports vary widely in format, requiring robust AI-based extraction prompts to standardize gene-phenotype data
- Mapping to clinical guidelines: Ensuring accurate matching between patient phenotypes and CPIC recommendations required careful data handling
- Balancing usability and clinical accuracy: We needed to present complex medical information in a way that is both precise and easy to interpret
- Time constraints: Integrating multiple systems (AI parsing, database, API lookup, UI) within a hackathon timeframe required prioritization and rapid iteration

## Accomplishments that we're proud of

- Successfully built an end-to-end pharmacogenomics decision-support tool within a hackathon timeframe
- Transformed unstructured PGx reports into structured, usable gene-phenotype data using AI
- Integrated real clinical guidelines (CPIC) to generate evidence-based drug recommendations
- Designed an intuitive, color-coded system (red/yellow/green) to clearly communicate clinical risk
- Created a scalable architecture combining frontend, database, AI parsing, and external APIs
- Bridged the gap between complex genetic data and practical clinical decision-making
- Delivered a polished, functional prototype that demonstrates real-world healthcare impact

## What we learned

- How to integrate AI-driven data extraction into a real clinical workflow
- The importance of standardized medical data structures for interoperability
- How to design user interfaces for healthcare professionals, where clarity and trust are critical
- The potential of combining genomics + AI + decision support systems to improve patient care

## What's next for GenoScript

- Integration with electronic health records (EHR systems)
- Real-time clinical validation and provider feedback loops
