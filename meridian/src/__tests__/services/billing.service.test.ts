import { describe, it, expect } from "vitest";
import { parseBillingCSV } from "../../server/services/billing.service";

describe("parseBillingCSV", () => {
  it("parses a valid CSV with correct columns", () => {
    const csv = `Date,Service,Cost
2026-01-01,EC2,100.50
2026-01-02,S3,20.00
2026-01-03,RDS,55.75`;

    const records = parseBillingCSV(csv);
    expect(records).toHaveLength(3);
    expect(records[0]).toMatchObject({ service: "EC2", cost: 100.5 });
    expect(records[1]).toMatchObject({ service: "S3", cost: 20.0 });
    expect(records[2]).toMatchObject({ service: "RDS", cost: 55.75 });
  });

  it("is case-insensitive for column headers", () => {
    const csv = `date,service,cost
2026-01-01,Lambda,10`;
    const records = parseBillingCSV(csv);
    expect(records).toHaveLength(1);
    expect(records[0].service).toBe("Lambda");
  });

  it("strips $ signs from cost values", () => {
    const csv = `Date,Service,Cost
2026-01-01,EC2,$99.99`;
    const records = parseBillingCSV(csv);
    expect(records[0].cost).toBe(99.99);
  });

  it("parses plain numeric cost values", () => {
    const csv = `Date,Service,Cost
2026-01-01,EC2,1234.56`;
    const records = parseBillingCSV(csv);
    expect(records[0].cost).toBe(1234.56);
  });

  it("skips blank lines gracefully", () => {
    const csv = `Date,Service,Cost
2026-01-01,EC2,50

2026-01-02,S3,25
`;
    const records = parseBillingCSV(csv);
    expect(records).toHaveLength(2);
  });

  it("throws if CSV has fewer than 2 lines", () => {
    expect(() => parseBillingCSV("Date,Service,Cost")).toThrow(
      "CSV must contain at least a header and one data row"
    );
  });

  it("throws if required columns are missing", () => {
    const csv = `Date,Service
2026-01-01,EC2`;
    expect(() => parseBillingCSV(csv)).toThrow(
      "CSV must have 'Date', 'Service', and 'Cost' columns"
    );
  });

  it("throws on invalid date values", () => {
    const csv = `Date,Service,Cost
not-a-date,EC2,100`;
    expect(() => parseBillingCSV(csv)).toThrow();
  });

  it("throws on negative cost values", () => {
    const csv = `Date,Service,Cost
2026-01-01,EC2,-5`;
    expect(() => parseBillingCSV(csv)).toThrow();
  });

  it("correctly parses dates as Date objects", () => {
    const csv = `Date,Service,Cost
2026-06-15,EC2,100`;
    const records = parseBillingCSV(csv);
    expect(records[0].date).toBeInstanceOf(Date);
    expect(records[0].date.getFullYear()).toBe(2026);
    expect(records[0].date.getMonth()).toBe(5); // 0-indexed: June = 5
    expect(records[0].date.getDate()).toBe(15);
  });

  it("handles multiple services in a single file", () => {
    const csv = `Date,Service,Cost
2026-01-01,EC2,100
2026-01-01,S3,50
2026-01-01,RDS,200`;
    const records = parseBillingCSV(csv);
    const services = records.map((r) => r.service);
    expect(services).toContain("EC2");
    expect(services).toContain("S3");
    expect(services).toContain("RDS");
  });
});
