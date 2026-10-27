"""Retry behaviour for the canada.ca fetch. No network."""
import importlib.util
import pathlib
import unittest
import urllib.error

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("check_rules", ROOT / "scripts" / "check_rules.py")
check_rules = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check_rules)


class Body:
    def __init__(self, data):
        self.data = data

    def read(self):
        return self.data

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class FetchRetryTest(unittest.TestCase):
    def test_retries_a_stalled_read_then_returns_the_page(self):
        calls = []
        sleeps = []

        def opener(req, timeout):
            calls.append((req.full_url, timeout, req.get_header("User-agent")))
            if len(calls) < 3:
                raise TimeoutError("The read operation timed out")
            return Body(b"<html>ok</html>")

        html = check_rules.fetch("https://example.test/recovery-tax", opener=opener, sleep=sleeps.append)
        self.assertEqual(html, "<html>ok</html>")
        self.assertEqual(len(calls), 3)
        self.assertEqual(calls[0][1], 60)
        self.assertIn("oas-clawback", calls[0][2])
        self.assertEqual(sleeps, [1, 2])

    def test_gives_up_after_three_timeouts(self):
        calls = []

        def opener(req, timeout):
            calls.append(1)
            raise TimeoutError("The read operation timed out")

        with self.assertRaises(RuntimeError) as caught:
            check_rules.fetch("https://example.test/recovery-tax", opener=opener, sleep=lambda _s: None)
        self.assertEqual(len(calls), 3)
        self.assertIn("https://example.test/recovery-tax", str(caught.exception))
        self.assertIn("The read operation timed out", str(caught.exception))

    def test_does_not_retry_a_missing_page(self):
        calls = []

        def opener(req, timeout):
            calls.append(1)
            raise urllib.error.HTTPError(req.full_url, 404, "missing", hdrs=None, fp=None)

        with self.assertRaises(RuntimeError):
            check_rules.fetch("https://example.test/missing", opener=opener, sleep=lambda _s: None)
        self.assertEqual(calls, [1])

    def test_retries_a_server_error(self):
        calls = []

        def opener(req, timeout):
            calls.append(1)
            if len(calls) == 1:
                raise urllib.error.HTTPError(req.full_url, 503, "unavailable", hdrs=None, fp=None)
            return Body(b"ok")

        html = check_rules.fetch("https://example.test/payments", opener=opener, sleep=lambda _s: None)
        self.assertEqual(html, "ok")
        self.assertEqual(len(calls), 2)


class Proc:
    def __init__(self, code, out, err):
        self.returncode = code
        self.stdout = out
        self.stderr = err.encode("utf-8")


class CurlFetchTest(unittest.TestCase):
    def test_uses_ipv4_then_returns_the_page(self):
        calls = []

        def run(cmd, capture_output):
            calls.append(cmd)
            if len(calls) == 1:
                return Proc(28, b"", "curl: (28) Operation timed out")
            return Proc(0, b"<html>ok</html>", "")

        html = check_rules.fetch("https://example.test/recovery-tax", run=run, sleep=lambda _s: None)
        self.assertEqual(html, "<html>ok</html>")
        self.assertIn("--ipv4", calls[0])
        self.assertEqual(calls[0][-1], "https://example.test/recovery-tax")
        self.assertNotIn("--ipv4", calls[1])

    def test_does_not_retry_a_curl_404(self):
        calls = []

        def run(cmd, capture_output):
            calls.append(1)
            return Proc(22, b"", "curl: (22) The requested URL returned error: 404")

        with self.assertRaises(RuntimeError):
            check_rules.fetch("https://example.test/missing", run=run, sleep=lambda _s: None)
        self.assertEqual(calls, [1])


if __name__ == "__main__":
    unittest.main()
