#!/usr/bin/env python3
"""
Unified Test Runner for n8n-nodes-python

Supports running specific categories or all tests with detailed reporting.
Usage:
    python tests/run_all.py                    # Run all tests
    python tests/run_all.py --category unit    # Run only unit tests
    python tests/run_all.py --verbose          # Verbose output
    python tests/run_all.py --list             # List all available tests
"""

import sys
import os
import argparse
import subprocess
import time
from pathlib import Path
from typing import List, Dict, Tuple

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

class TestRunner:
    """Main test runner class"""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.tests_dir = Path(__file__).parent
        self.results = {
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'total_time': 0
        }
        
    def discover_tests(self, category: str = None) -> Dict[str, List[Path]]:
        """Discover all test files in specified category or all categories"""
        categories = ['unit', 'integration', 'functional', 'performance']
        
        if category and category not in categories:
            raise ValueError(f"Invalid category: {category}. Available: {categories}")
        
        test_files = {}
        
        target_categories = [category] if category else categories
        
        for cat in target_categories:
            cat_dir = self.tests_dir / cat
            if cat_dir.exists():
                # Find all Python files starting with 'test_'
                files = list(cat_dir.glob('test_*.py'))
                if files:
                    test_files[cat] = files
                    
        return test_files
    
    def run_python_test(self, test_file: Path) -> Tuple[bool, str, float]:
        """Run a single Python test file"""
        start_time = time.time()
        
        try:
            # Run the test file
            result = subprocess.run(
                [sys.executable, str(test_file)],
                capture_output=True,
                text=True,
                timeout=120,  # 2 minute timeout
                cwd=str(project_root)
            )
            
            execution_time = time.time() - start_time
            
            if result.returncode == 0:
                return True, result.stdout, execution_time
            else:
                error_output = result.stderr or result.stdout
                return False, error_output, execution_time
                
        except subprocess.TimeoutExpired:
            execution_time = time.time() - start_time
            return False, "Test timed out after 120 seconds", execution_time
        except Exception as e:
            execution_time = time.time() - start_time
            return False, f"Error running test: {str(e)}", execution_time
    
    def run_typescript_tests(self) -> Tuple[bool, str, float]:
        """Run TypeScript/Jest tests"""
        start_time = time.time()
        
        try:
            # Check if Jest is available
            jest_config = project_root / "jest.config.js"
            if not jest_config.exists():
                # Create basic Jest config if it doesn't exist
                jest_config.write_text("""
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/typescript/**/*.test.ts'],
  collectCoverageFrom: [
    'nodes/**/*.ts',
    '!nodes/**/*.d.ts',
  ],
};
""")
            
            result = subprocess.run(
                ["npm", "test"],
                capture_output=True,
                text=True,
                timeout=60,
                cwd=str(project_root)
            )
            
            execution_time = time.time() - start_time
            
            if result.returncode == 0:
                return True, result.stdout, execution_time
            else:
                return False, result.stderr or result.stdout, execution_time
                
        except subprocess.TimeoutExpired:
            execution_time = time.time() - start_time
            return False, "TypeScript tests timed out", execution_time
        except Exception as e:
            execution_time = time.time() - start_time
            return False, f"Error running TypeScript tests: {str(e)}", execution_time
    
    def print_test_header(self, category: str, test_count: int):
        """Print category header"""
        print(f"\n{'='*60}")
        print(f"🧪 Running {category.upper()} tests ({test_count} files)")
        print(f"{'='*60}")
    
    def print_test_result(self, test_file: Path, success: bool, output: str, exec_time: float):
        """Print individual test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        test_name = test_file.stem
        
        print(f"{status} {test_name} ({exec_time:.2f}s)")
        
        if self.verbose or not success:
            # Show output for failed tests or in verbose mode
            if output.strip():
                print(f"    Output: {output.strip()[:200]}...")
                if not success and len(output) > 200:
                    print(f"    (truncated, full output available)")
    
    def run_category(self, category: str, test_files: List[Path]) -> Dict:
        """Run all tests in a category"""
        self.print_test_header(category, len(test_files))
        
        category_results = {
            'passed': 0,
            'failed': 0,
            'total_time': 0,
            'tests': []
        }
        
        for test_file in test_files:
            success, output, exec_time = self.run_python_test(test_file)
            
            self.print_test_result(test_file, success, output, exec_time)
            
            category_results['total_time'] += exec_time
            category_results['tests'].append({
                'name': test_file.stem,
                'success': success,
                'time': exec_time,
                'output': output
            })
            
            if success:
                category_results['passed'] += 1
                self.results['passed'] += 1
            else:
                category_results['failed'] += 1
                self.results['failed'] += 1
        
        self.results['total_time'] += category_results['total_time']
        
        # Print category summary
        total = category_results['passed'] + category_results['failed']
        print(f"\n📊 {category.upper()} Summary: {category_results['passed']}/{total} passed ({category_results['total_time']:.2f}s)")
        
        return category_results
    
    def run_all_tests(self, category: str = None) -> Dict:
        """Run all tests or tests in specific category"""
        print("🚀 n8n-nodes-python Test Suite")
        print(f"📁 Tests directory: {self.tests_dir}")
        print(f"🎯 Target: {category or 'all categories'}")
        
        start_time = time.time()
        
        # Discover tests
        test_files = self.discover_tests(category)
        
        if not test_files:
            print("❌ No tests found!")
            return {'error': 'No tests found'}
        
        all_results = {}
        
        # Run Python tests by category
        for cat, files in test_files.items():
            all_results[cat] = self.run_category(cat, files)
        
        # Run TypeScript tests if no specific category or if typescript category
        if not category or category == 'typescript':
            ts_dir = self.tests_dir / 'typescript'
            if ts_dir.exists() and list(ts_dir.glob('*.test.ts')):
                print(f"\n{'='*60}")
                print("🧪 Running TYPESCRIPT tests")
                print(f"{'='*60}")
                
                success, output, exec_time = self.run_typescript_tests()
                self.print_test_result(Path("typescript/all.test.ts"), success, output, exec_time)
                
                if success:
                    self.results['passed'] += 1
                else:
                    self.results['failed'] += 1
                
                self.results['total_time'] += exec_time
        
        # Final summary
        total_time = time.time() - start_time
        self.print_final_summary(total_time)
        
        return all_results
    
    def print_final_summary(self, total_time: float):
        """Print final test summary"""
        total_tests = self.results['passed'] + self.results['failed']
        success_rate = (self.results['passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n{'='*60}")
        print("📋 FINAL TEST SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Success Rate: {success_rate:.1f}%")
        print(f"⏱️  Total Time: {total_time:.2f}s")
        
        if self.results['failed'] == 0:
            print("🎉 All tests passed!")
        else:
            print("💥 Some tests failed!")
            
    def list_tests(self):
        """List all available tests"""
        test_files = self.discover_tests()
        
        print("📋 Available Tests:")
        print("="*50)
        
        for category, files in test_files.items():
            print(f"\n📁 {category.upper()} ({len(files)} tests):")
            for test_file in files:
                print(f"   • {test_file.stem}")
        
        # Count TypeScript tests
        ts_dir = self.tests_dir / 'typescript'
        if ts_dir.exists():
            ts_files = list(ts_dir.glob('*.test.ts'))
            if ts_files:
                print(f"\n📁 TYPESCRIPT ({len(ts_files)} tests):")
                for test_file in ts_files:
                    print(f"   • {test_file.stem}")

def main():
    parser = argparse.ArgumentParser(
        description='Run n8n-nodes-python tests',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python tests/run_all.py                    # Run all tests
  python tests/run_all.py --category unit    # Run only unit tests
  python tests/run_all.py --verbose          # Verbose output
  python tests/run_all.py --list             # List available tests
        """
    )
    
    parser.add_argument(
        '--category', 
        choices=['unit', 'integration', 'functional', 'performance', 'typescript'],
        help='Test category to run'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )
    parser.add_argument(
        '--list', '-l',
        action='store_true',
        help='List all available tests'
    )
    
    args = parser.parse_args()
    
    runner = TestRunner(verbose=args.verbose)
    
    if args.list:
        runner.list_tests()
        return
    
    try:
        results = runner.run_all_tests(args.category)
        
        # Exit with error code if any tests failed
        if runner.results['failed'] > 0:
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 