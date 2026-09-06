import { PageHeader, Card } from "@/components/Ui";
import { inboxMessages } from "@/lib/inbox";

export default function MessagesPage() {
  return (
    <div>
      <PageHeader
        kicker="Inbox"
        title="Messages"
        lede="Match reminders, desk notes, and league updates."
      />
      <div className="space-y-3">
        {inboxMessages.length === 0 ? (
          <p className="text-sm text-berkeley/60">No messages yet.</p>
        ) : null}
        {inboxMessages.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-berkeley/70">{item.body}</p>
              </div>
              <p className="shrink-0 text-xs uppercase tracking-widest text-berkeley/45">{item.time}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
