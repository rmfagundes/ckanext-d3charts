from setuptools import setup, find_packages
import sys, os

version = '0.1'

setup(
	name='ckanext-d3charts',
	version=version,
	description="D3.js charts for CKAN",
	long_description="""\
	""",
	classifiers=[], # Get strings from http://pypi.python.org/pypi?%3Aaction=list_classifiers
	keywords='',
	author='Rodrigo Fagundes',
	author_email='rmfagundes@gmail.com',
	url='https://github.com/rmfagundes/ckanext-d3charts',
	license='',
	packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
	namespace_packages=['ckanext', 'ckanext.d3charts'],
	include_package_data=True,
	zip_safe=False,
	install_requires=[
		# -*- Extra requirements: -*-
	],
	entry_points=\
	"""
    [ckan.plugins]
	d3calendar=ckanext.d3charts.plugin:D3CalendarChart
    d3histogram=ckanext.d3charts.plugin:D3HistogramChart
	""",
)
