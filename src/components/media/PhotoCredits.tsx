import { getImageCredits, type ImageCredit } from "@/data/image-credits";

type PhotoCreditsProps = {
  imageKeys: string[];
  /** Visible label for the collapsed control. */
  label?: string;
};

function licenceNote(credit: ImageCredit) {
  if (credit.shareAlike) return `${credit.licence} (attribution and ShareAlike required)`;
  if (credit.attributionRequired) return `${credit.licence} (attribution required)`;
  return credit.licence;
}

export function PhotoCredits({ imageKeys, label = "Photo credits" }: PhotoCreditsProps) {
  const credits = getImageCredits(imageKeys);
  if (credits.length === 0) return null;

  return (
    <details className="photo-credits mt-3 max-w-xl text-xs leading-relaxed text-gray-500">
      <summary className="cursor-pointer select-none text-gray-500 hover:text-gray-700">
        {label}
      </summary>
      <ul className="mt-2 space-y-2">
        {credits.map((credit) => (
          <li key={credit.imageKey}>
            <span className="text-gray-600">
              {credit.workTitle} — {credit.creator} / {credit.sourcePlatform}.
            </span>{" "}
            <a
              href={credit.sourceUrl}
              className="underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
              rel="noopener noreferrer"
            >
              Source
            </a>
            {credit.licenceUrl ? (
              <>
                {" · "}
                <a
                  href={credit.licenceUrl}
                  className="underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
                  rel="noopener noreferrer"
                >
                  {licenceNote(credit)}
                </a>
              </>
            ) : (
              <> · {licenceNote(credit)}</>
            )}
            {credit.modifications ? ` Modified: ${credit.modifications}` : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
