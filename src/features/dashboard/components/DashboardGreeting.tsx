type DashboardGreetingProps = {
  hello: string;
  name: string;
  dateLabel: string;
};

export function DashboardGreeting({ hello, name, dateLabel }: DashboardGreetingProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {hello}, {name} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p>
    </div>
  );
}
