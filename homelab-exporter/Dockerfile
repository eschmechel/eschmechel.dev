# Static, non-root, no shell. Run with --network host (or a lab network) and LISTEN on localhost/the
# tunnel's network only — never publish this port to the internet; cloudflared + Access front it.
FROM golang:1.27 AS build
WORKDIR /src
COPY go.mod ./
COPY *.go ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /homelab-exporter .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /homelab-exporter /homelab-exporter
USER nonroot:nonroot
EXPOSE 9477
ENTRYPOINT ["/homelab-exporter"]
