type NodeResponse = {
  status: (code: number) => NodeResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

export default function handler(_: unknown, res: NodeResponse): void {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok' });
}
